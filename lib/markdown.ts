import type { TranscriptionSegment } from "@/types/transcription";

export function formatTimestamp(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function buildMarkdown(
  fileName: string,
  date: string,
  segments: TranscriptionSegment[],
): string {
  const body = segments
    .map((seg) => `[${formatTimestamp(seg.startMs)}]\n${seg.text}`)
    .join("\n\n");

  return `# Transcripción

## Archivo
${fileName}

## Fecha
${date}

---

## Contenido

${body}
`;
}

export function buildPlainText(segments: TranscriptionSegment[]): string {
  return segments.map((seg) => seg.text).join("\n\n");
}
