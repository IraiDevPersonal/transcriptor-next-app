import fs from "node:fs";
import { getGroqClient, GROQ_TRANSCRIPTION_MODEL } from "./groq";
import type { AudioChunk } from "./splitAudio";
import type { TranscriptionSegment } from "@/types/transcription";

export async function transcribeChunk(chunk: AudioChunk): Promise<string> {
  const client = getGroqClient();
  const stream = fs.createReadStream(chunk.filePath);

  const response = await client.audio.transcriptions.create({
    file: stream,
    model: GROQ_TRANSCRIPTION_MODEL,
    response_format: "text",
  });

  if (typeof response === "string") return response.trim();
  const maybeText = (response as { text?: string }).text;
  return (maybeText ?? "").trim();
}

export async function transcribeChunks(
  chunks: AudioChunk[],
): Promise<TranscriptionSegment[]> {
  const segments: TranscriptionSegment[] = [];

  for (const chunk of chunks) {
    const text = await transcribeChunk(chunk);
    segments.push({
      startMs: Math.round(chunk.startSec * 1000),
      text,
    });
  }

  return segments;
}
