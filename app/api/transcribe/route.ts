import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import { parseMultipart } from "@/lib/parseUpload";
import { splitAudioIntoChunks } from "@/lib/splitAudio";
import { transcribeChunks } from "@/lib/transcription";
import { buildMarkdown, buildPlainText } from "@/lib/markdown";
import { probeDuration } from "@/lib/ffmpeg";
import type { TranscriptionResult } from "@/types/transcription";

export const runtime = "nodejs";
export const maxDuration = 300;

const ALLOWED_EXTENSIONS = new Set([".mp3", ".wav", ".m4a", ".webm"]);
const MAX_DURATION_SEC = 60 * 60;

const UPLOAD_DIR = path.join("/tmp", "uploads");
const CHUNK_ROOT = path.join("/tmp", "chunks");

export async function POST(req: Request) {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.mkdir(CHUNK_ROOT, { recursive: true });

  let uploadedPath: string | null = null;
  let chunkDir: string | null = null;

  try {
    const { files } = await parseMultipart(req, UPLOAD_DIR);
    const fileField = files.audio ?? files.file;
    const file = Array.isArray(fileField) ? fileField[0] : fileField;

    if (!file) {
      return NextResponse.json(
        { error: "No se recibió archivo de audio." },
        { status: 400 },
      );
    }

    uploadedPath = file.filepath;
    const originalName = file.originalFilename ?? "audio";
    const ext = path.extname(originalName).toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: `Formato no soportado: ${ext || "desconocido"}. Use mp3, wav, m4a o webm.` },
        { status: 400 },
      );
    }

    const duration = await probeDuration(uploadedPath);
    if (!duration || duration <= 0) {
      return NextResponse.json(
        { error: "No se pudo leer el archivo de audio." },
        { status: 400 },
      );
    }
    if (duration > MAX_DURATION_SEC) {
      return NextResponse.json(
        { error: `Audio demasiado largo (${Math.round(duration / 60)} min). Máximo permitido: ${MAX_DURATION_SEC / 60} min.` },
        { status: 400 },
      );
    }

    chunkDir = path.join(CHUNK_ROOT, `job_${Date.now()}`);
    const chunks = await splitAudioIntoChunks(uploadedPath, chunkDir);

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: "No se pudieron generar fragmentos del audio." },
        { status: 500 },
      );
    }

    const segments = await transcribeChunks(chunks);
    const fullText = buildPlainText(segments);
    const date = new Date().toISOString().slice(0, 10);
    const markdown = buildMarkdown(originalName, date, segments);

    const result: TranscriptionResult = {
      fileName: originalName,
      date,
      fullText,
      markdown,
      segments,
      durationSec: duration,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("[transcribe] error:", err);
    const message =
      err instanceof Error ? err.message : "Error desconocido al procesar el audio.";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    if (uploadedPath) await safeRemove(uploadedPath);
    if (chunkDir) await safeRemoveDir(chunkDir);
  }
}

async function safeRemove(filePath: string) {
  try {
    await fs.unlink(filePath);
  } catch {
    // ignorar
  }
}

async function safeRemoveDir(dir: string) {
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch {
    // ignorar
  }
}
