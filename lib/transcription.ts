import fs from "node:fs";
import { getGroqClient, GROQ_TRANSCRIPTION_MODEL } from "./groq";
import type { AudioChunk } from "./splitAudio";
import type { TranscriptionSegment, VerboseSegment } from "@/types/transcription";

interface WhisperVerboseSegment {
  start: number;
  end: number;
  text: string;
}

interface WhisperVerboseResponse {
  text: string;
  segments?: WhisperVerboseSegment[];
}

interface ChunkResult {
  text: string;
  verboseSegments: VerboseSegment[];
}

export async function transcribeChunk(chunk: AudioChunk): Promise<ChunkResult> {
  const client = getGroqClient();
  const stream = fs.createReadStream(chunk.filePath);

  const raw = await client.audio.transcriptions.create({
    file: stream,
    model: GROQ_TRANSCRIPTION_MODEL,
    response_format: "verbose_json",
  });

  const response = raw as unknown as WhisperVerboseResponse;
  const text = response.text?.trim() ?? "";
  const rawSegs = response.segments ?? [];

  let prevEnd = chunk.startSec;
  const verboseSegments: VerboseSegment[] = rawSegs
    .filter((s) => s.text.trim())
    .map((s) => {
      const abs: VerboseSegment = {
        start: chunk.startSec + s.start,
        end: chunk.startSec + s.end,
        text: s.text.trim(),
        gapBefore: Math.max(0, chunk.startSec + s.start - prevEnd),
      };
      prevEnd = chunk.startSec + s.end;
      return abs;
    });

  return { text, verboseSegments };
}

export async function transcribeChunks(chunks: AudioChunk[]): Promise<{
  segments: TranscriptionSegment[];
  verboseSegments: VerboseSegment[];
}> {
  const segments: TranscriptionSegment[] = [];
  const verboseSegments: VerboseSegment[] = [];

  for (const chunk of chunks) {
    const result = await transcribeChunk(chunk);
    segments.push({ startMs: Math.round(chunk.startSec * 1000), text: result.text });
    verboseSegments.push(...result.verboseSegments);
  }

  return { segments, verboseSegments };
}

export async function transcribeFileDirect(
  filePath: string,
  originalName: string,
): Promise<{ segments: TranscriptionSegment[]; verboseSegments: VerboseSegment[] }> {
  const client = getGroqClient();
  const stream = fs.createReadStream(filePath);
  (stream as NodeJS.ReadableStream & { name?: string }).name = originalName;

  const raw = await client.audio.transcriptions.create({
    file: stream as unknown as File,
    model: GROQ_TRANSCRIPTION_MODEL,
    response_format: "verbose_json",
  });

  const response = raw as unknown as WhisperVerboseResponse;
  const text = response.text?.trim() ?? "";
  const rawSegs = response.segments ?? [];

  let prevEnd = 0;
  const verboseSegments: VerboseSegment[] = rawSegs
    .filter((s) => s.text.trim())
    .map((s) => {
      const seg: VerboseSegment = {
        start: s.start,
        end: s.end,
        text: s.text.trim(),
        gapBefore: Math.max(0, s.start - prevEnd),
      };
      prevEnd = s.end;
      return seg;
    });

  return {
    segments: [{ startMs: 0, text }],
    verboseSegments,
  };
}
