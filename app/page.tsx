"use client";

import { useState } from "react";
import { UploadForm } from "@/components/UploadForm";
import { ProgressBar } from "@/components/ProgressBar";
import { ResultCard } from "@/components/ResultCard";
import { DownloadButtons } from "@/components/DownloadButtons";
import { ProcessingOptions } from "@/components/ProcessingOptions";
import type {
  PostProcessOptions,
  PostProcessResult,
  TranscriptionResult,
  TranscriptionStatus,
} from "@/types/transcription";

const DEFAULT_OPTIONS: PostProcessOptions = {
  fixPunctuation: false,
  separateSpeakers: false,
  cleanupFillers: false,
  clinicalSummary: false,
};

type AppStatus = TranscriptionStatus | "postprocessing";

export default function HomePage() {
  const [status, setStatus] = useState<AppStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [postResult, setPostResult] = useState<PostProcessResult | null>(null);
  const [options, setOptions] = useState<PostProcessOptions>(DEFAULT_OPTIONS);

  const isBusy =
    status === "uploading" ||
    status === "processing" ||
    status === "postprocessing";

  async function handleTranscribe(file: File) {
    setStatus("uploading");
    setErrorMessage(null);
    setResult(null);
    setPostResult(null);

    const formData = new FormData();
    formData.append("audio", file);

    let transcription: TranscriptionResult;

    try {
      setStatus("processing");
      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data?.error ?? `Error ${res.status}`);
      }

      transcription = (await res.json()) as TranscriptionResult;
      setResult(transcription);
    } catch (err) {
      setErrorMessage(toMessage(err));
      setStatus("error");
      return;
    }

    const anyOption = Object.values(options).some(Boolean);
    if (!anyOption) {
      setStatus("complete");
      return;
    }

    try {
      setStatus("postprocessing");
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: transcription.fullText,
          options,
          verboseSegments: transcription.verboseSegments,
        }),
      });

      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data?.error ?? `Error ${res.status}`);
      }

      const processed = (await res.json()) as PostProcessResult;
      setPostResult(processed);
    } catch (err) {
      setErrorMessage(`Post-procesamiento fallido: ${toMessage(err)}`);
    }

    setStatus("complete");
  }

  const progressMessage: Record<string, string> = {
    uploading: "Subiendo archivo...",
    processing: "Transcribiendo audio...",
    postprocessing: "Aplicando opciones de procesamiento...",
    complete: "Completado",
    error: errorMessage ?? "Error",
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Transcriptor de Audio
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Sube un archivo de audio (mp3, wav, m4a, webm) y obtén la transcripción
          en .txt o .md.
        </p>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-5">
          <UploadForm disabled={isBusy} onSubmit={handleTranscribe} />
          <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
            <ProcessingOptions
              value={options}
              onChange={setOptions}
              disabled={isBusy}
            />
          </div>
        </div>
      </section>

      {status !== "idle" && (
        <section>
          <ProgressBar
            status={status === "postprocessing" ? "processing" : status}
            message={progressMessage[status]}
          />
        </section>
      )}

      {status !== "idle" && errorMessage && status !== "complete" && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {errorMessage}
        </div>
      )}

      {result && status === "complete" && (
        <>
          {errorMessage && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
              {errorMessage}
            </div>
          )}
          <ResultCard
            result={result}
            processedText={postResult?.processedText}
            summary={postResult?.summary}
          />
          <DownloadButtons
            result={result}
            processedText={postResult?.processedText}
            summary={postResult?.summary}
          />
        </>
      )}
    </main>
  );
}

async function safeJson(res: Response): Promise<{ error?: string } | null> {
  try {
    return (await res.json()) as { error?: string };
  } catch {
    return null;
  }
}

function toMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Error desconocido.";
}
