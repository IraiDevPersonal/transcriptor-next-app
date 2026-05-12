"use client";

import { useState } from "react";
import { UploadForm } from "@/components/UploadForm";
import { ProgressBar } from "@/components/ProgressBar";
import { ResultCard } from "@/components/ResultCard";
import { DownloadButtons } from "@/components/DownloadButtons";
import type {
  TranscriptionResult,
  TranscriptionStatus,
} from "@/types/transcription";

export default function HomePage() {
  const [status, setStatus] = useState<TranscriptionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<TranscriptionResult | null>(null);

  async function handleTranscribe(file: File) {
    setStatus("uploading");
    setErrorMessage(null);
    setResult(null);

    const formData = new FormData();
    formData.append("audio", file);

    try {
      setStatus("processing");
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await safeJson(response);
        throw new Error(data?.error ?? `Error ${response.status}`);
      }

      const data = (await response.json()) as TranscriptionResult;
      setResult(data);
      setStatus("complete");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error desconocido.";
      setErrorMessage(message);
      setStatus("error");
    }
  }

  const isBusy = status === "uploading" || status === "processing";

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
        <UploadForm disabled={isBusy} onSubmit={handleTranscribe} />
      </section>

      {(isBusy || status === "complete" || status === "error") && (
        <section>
          <ProgressBar
            status={status}
            message={status === "error" ? errorMessage ?? "Error" : undefined}
          />
        </section>
      )}

      {result && status === "complete" && (
        <>
          <ResultCard result={result} />
          <DownloadButtons result={result} />
        </>
      )}

      {status === "error" && errorMessage && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {errorMessage}
        </div>
      )}
    </main>
  );
}

async function safeJson(response: Response): Promise<{ error?: string } | null> {
  try {
    return (await response.json()) as { error?: string };
  } catch {
    return null;
  }
}
