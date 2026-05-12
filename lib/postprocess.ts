import { getGroqClient } from "./groq";
import type { PostProcessOptions, PostProcessResult } from "@/types/transcription";

const CHAT_MODEL = "llama-3.3-70b-versatile";

export async function postProcessTranscription(
  text: string,
  options: PostProcessOptions,
): Promise<PostProcessResult> {
  const anyTextOption =
    options.fixPunctuation || options.separateSpeakers || options.cleanupFillers;

  let processedText = text;
  let summary: string | null = null;

  if (anyTextOption) {
    processedText = await applyTextTransformations(text, options);
  }

  if (options.clinicalSummary) {
    summary = await generateClinicalSummary(processedText || text);
  }

  return { processedText, summary };
}

async function applyTextTransformations(
  text: string,
  options: PostProcessOptions,
): Promise<string> {
  const instructions: string[] = [];

  if (options.fixPunctuation) {
    instructions.push(
      "- Corrige la puntuación, ortografía y mayúsculas del texto. Asegúrate de que las oraciones estén bien delimitadas.",
    );
  }

  if (options.separateSpeakers) {
    instructions.push(
      '- Identifica y separa los turnos de habla entre los participantes. Etiqueta al profesional como "Psicóloga:" y al consultante como "Paciente:". Si no puedes distinguirlos con certeza, usa "Hablante 1:" y "Hablante 2:".',
    );
  }

  if (options.cleanupFillers) {
    instructions.push(
      '- Elimina muletillas, repeticiones innecesarias y ruido verbal (como "eh", "mmm", "o sea", "este") sin cambiar el significado ni el tono del discurso.',
    );
  }

  const systemPrompt = `Eres un asistente especializado en transcripciones de sesiones clínicas de psicología.
Tu tarea es procesar el texto de una transcripción aplicando SOLO las siguientes instrucciones, sin agregar información ni cambiar el contenido:

${instructions.join("\n")}

Devuelve ÚNICAMENTE el texto procesado, sin explicaciones ni comentarios adicionales.`;

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
