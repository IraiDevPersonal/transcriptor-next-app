import { getGroqClient } from "./groq";
import type {
  PostProcessOptions,
  PostProcessResult,
  VerboseSegment,
} from "@/types/transcription";

const CHAT_MODEL = "llama-3.3-70b-versatile";

// Pausa mínima en segundos para considerar un posible cambio de hablante
const SPEAKER_CHANGE_GAP_SEC = 1.0;

export async function postProcessTranscription(
  text: string,
  options: PostProcessOptions,
  verboseSegments?: VerboseSegment[],
): Promise<PostProcessResult> {
  const anyTextOption =
    options.fixPunctuation || options.separateSpeakers || options.cleanupFillers;

  let processedText = text;
  let summary: string | null = null;

  if (anyTextOption) {
    processedText = await applyTextTransformations(text, options, verboseSegments);
  }

  if (options.clinicalSummary) {
    summary = await generateClinicalSummary(processedText || text);
  }

  return { processedText, summary };
}

// ─── Transformaciones de texto ────────────────────────────────────────────────

async function applyTextTransformations(
  text: string,
  options: PostProcessOptions,
  verboseSegments?: VerboseSegment[],
): Promise<string> {
  // Si hay separación de hablantes y tenemos segmentos con timestamps,
  // usamos un pipeline especializado más preciso.
  if (options.separateSpeakers && verboseSegments && verboseSegments.length > 0) {
    return separateSpeakersWithTimestamps(text, options, verboseSegments);
  }

  // Fallback: transformaciones en un solo prompt sin timestamps
  return applyTransformationsPlain(text, options);
}

async function separateSpeakersWithTimestamps(
  text: string,
  options: PostProcessOptions,
  verboseSegments: VerboseSegment[],
): Promise<string> {
  const turns = groupSegmentsIntoTurns(verboseSegments, SPEAKER_CHANGE_GAP_SEC);
  const timedTranscript = formatTurnsForLlm(turns);

  const extraInstructions: string[] = [];
  if (options.fixPunctuation) {
    extraInstructions.push(
      "- Corrige la puntuación, ortografía y mayúsculas dentro de cada turno.",
    );
  }
  if (options.cleanupFillers) {
    extraInstructions.push(
      '- Dentro de cada turno, elimina muletillas y ruido verbal ("eh", "mmm", "o sea", "este", repeticiones).',
    );
  }

  const extraBlock =
    extraInstructions.length > 0
      ? `\nAdemás, aplica estas instrucciones adicionales:\n${extraInstructions.join("\n")}`
      : "";

  const systemPrompt = `Eres un especialista en diarización de sesiones clínicas de psicología.

Recibirás una transcripción de una sesión terapéutica dividida en TURNOS DE HABLA. Cada turno tiene:
- Un timestamp de inicio
- Una indicación de la PAUSA que hubo antes del turno (pausa larga = cambio de hablante probable)
- El texto hablado en ese turno

Tu tarea es asignar a cada turno quién habló: "Psicóloga" o "Paciente".

REGLAS PARA IDENTIFICAR A CADA HABLANTE:

Psicóloga (terapeuta/profesional):
- Hace preguntas abiertas o reflexivas: "¿Cómo te sentiste cuando...?", "¿Qué piensas sobre...?"
- Refleja y parafrasea lo que dice el paciente: "Entonces lo que me estás diciendo es...", "Parece que..."
- Hace intervenciones breves y enfocadas
- Usa lenguaje técnico o clínico ocasionalmente
- Guía la conversación, introduce temas o cambia el foco
- Sus turnos suelen ser más cortos que los del paciente

Paciente:
- Narra experiencias personales en primera persona: "Yo", "me", "mi", "a mí"
- Expresa emociones: "me siento", "estoy", "me da miedo", "me pone triste"
- Cuenta historias y situaciones de su vida
- Sus turnos suelen ser más largos y narrativos
- Puede responder con monosílabos o frases cortas cuando está incómodo

REGLAS DE CONSISTENCIA:
- Una vez identificado quién empieza, mantén la alternancia (Psicóloga → Paciente → Psicóloga...)
- Si hay varios turnos seguidos del mismo hablante (pausas cortas dentro de un mismo parlamento), es válido
- Las pausas largas (indicadas como ↕ PAUSA LARGA) son la señal más confiable de cambio de hablante
- En caso de duda, usa el patrón pregunta/respuesta como guía${extraBlock}

FORMATO DE SALIDA:
Devuelve la transcripción con el formato:

Psicóloga: [texto del turno]

Paciente: [texto del turno]

Psicóloga: [texto del turno]

No incluyas timestamps ni metadatos. Solo los turnos etiquetados.
Devuelve ÚNICAMENTE el texto procesado.`;

  const client = getGroqClient();
  const response = await client.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: timedTranscript },
    ],
    temperature: 0.1,
  });

  return response.choices[0]?.message?.content?.trim() ?? text;
}

async function applyTransformationsPlain(
  text: string,
  options: PostProcessOptions,
): Promise<string> {
  const instructions: string[] = [];

  if (options.fixPunctuation) {
    instructions.push(
      "- Corrige la puntuación, ortografía y mayúsculas del texto.",
    );
  }
  if (options.separateSpeakers) {
    instructions.push(
      '- Identifica los turnos de habla. Etiqueta al profesional como "Psicóloga:" y al consultante como "Paciente:". Si no puedes distinguirlos, usa "Hablante 1:" y "Hablante 2:".',
    );
  }
  if (options.cleanupFillers) {
    instructions.push(
      '- Elimina muletillas y ruido verbal ("eh", "mmm", "o sea", "este", repeticiones).',
    );
  }

  const systemPrompt = `Eres un asistente especializado en transcripciones de sesiones clínicas de psicología.
Aplica SOLO las siguientes instrucciones al texto, sin agregar información ni cambiar el contenido:

${instructions.join("\n")}

Devuelve ÚNICAMENTE el texto procesado.`;

  const client = getGroqClient();
  const response = await client.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text },
    ],
    temperature: 0.2,
  });

  return response.choices[0]?.message?.content?.trim() ?? text;
}

// ─── Agrupación de segmentos en turnos ───────────────────────────────────────

interface Turn {
  start: number;
  end: number;
  text: string;
  gapBefore: number; // pausa antes del turno (segundos)
}

function groupSegmentsIntoTurns(
  segments: VerboseSegment[],
  minGapSec: number,
): Turn[] {
  if (segments.length === 0) return [];

  const turns: Turn[] = [];
  let current: Turn = {
    start: segments[0].start,
    end: segments[0].end,
    text: segments[0].text,
    gapBefore: 0,
  };

  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i];
    if (seg.gapBefore >= minGapSec) {
      // Pausa suficiente → cerrar turno actual y abrir uno nuevo
      turns.push(current);
      current = {
        start: seg.start,
        end: seg.end,
        text: seg.text,
        gapBefore: seg.gapBefore,
      };
    } else {
      // Pausa corta → continuar el mismo turno
      current.end = seg.end;
      current.text += " " + seg.text;
    }
  }
  turns.push(current);

  return turns;
}

function formatTimestamp(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatTurnsForLlm(turns: Turn[]): string {
  return turns
    .map((turn, i) => {
      const gapLabel =
        i === 0
          ? ""
          : turn.gapBefore >= 2.0
            ? `\n↕ PAUSA LARGA (${turn.gapBefore.toFixed(1)}s — probable cambio de hablante)\n`
            : `\n↕ pausa corta (${turn.gapBefore.toFixed(1)}s)\n`;
      return `${gapLabel}[${formatTimestamp(turn.start)}] ${turn.text}`;
    })
    .join("\n");
}

// ─── Resumen clínico ──────────────────────────────────────────────────────────

async function generateClinicalSummary(text: string): Promise<string> {
  const systemPrompt = `Eres un asistente especializado en documentación clínica de psicología.
A partir de la transcripción de una sesión, genera un resumen clínico estructurado con las siguientes secciones:

1. **Motivo de consulta / Tema principal**
2. **Temas abordados**
3. **Estado emocional del paciente**
4. **Intervenciones del profesional**
5. **Puntos relevantes para seguimiento**

Usa lenguaje clínico profesional. Si la información no está disponible en el texto, omite esa sección.
Devuelve ÚNICAMENTE el resumen, sin comentarios adicionales.`;

  const client = getGroqClient();
  const response = await client.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text },
    ],
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content?.trim() ?? "";
}
