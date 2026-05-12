export type TranscriptionStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "complete"
  | "error";

export interface TranscriptionSegment {
  startMs: number;
  text: string;
}

export interface TranscriptionResult {
  fileName: string;
  date: string;
  fullText: string;
  markdown: string;
  segments: TranscriptionSegment[];
  verboseSegments?: VerboseSegment[];
  durationSec: number;
}

export interface TranscriptionError {
  error: string;
}

export interface PostProcessOptions {
  fixPunctuation: boolean;
  separateSpeakers: boolean;
  cleanupFillers: boolean;
  clinicalSummary: boolean;
}

export interface PostProcessResult {
  processedText: string;
  summary: string | null;
}

export interface VerboseSegment {
  start: number; // segundos desde el inicio del audio completo
  end: number;
  text: string;
  gapBefore: number; // pausa respecto al segmento anterior (segundos)
}
