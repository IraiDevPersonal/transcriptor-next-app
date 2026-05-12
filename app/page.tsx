"use client";

import { useState } from "react";
import { UploadForm } from "@/components/UploadForm";
import { ProgressBar } from "@/components/ProgressBar";
import { ResultCard } from "@/components/ResultCard";
import { DownloadButtons } from "@/components/DownloadButtons";
import { ProcessingOptions } from "@/components/ProcessingOptions";
import { ThemeToggle } from "@/components/ThemeToggle";
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

const STATUS_LABEL: Record<string, string> = {
  uploading: "Subiendo archivo…",
  processing: "Transcribiendo audio…",
  postprocessing: "Aplicando procesamiento con IA…",
  complete: "Completado",
};

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
      if (!res.ok)
        throw new Error((await safeJson(res))?.error ?? `Error ${res.status}`);
      transcription = (await res.json()) as TranscriptionResult;
      setResult(transcription);
    } catch (err) {
      setErrorMessage(toMsg(err));
      setStatus("error");
      return;
    }

    if (!Object.values(options).some(Boolean)) {
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
      if (!res.ok)
        throw new Error((await safeJson(res))?.error ?? `Error ${res.status}`);
      setPostResult((await res.json()) as PostProcessResult);
    } catch (err) {
      setErrorMessage(`Post-procesamiento fallido: ${toMsg(err)}`);
    }

    setStatus("complete");
  }

  const progressStatus =
    status === "postprocessing"
      ? "processing"
      : (status as TranscriptionStatus);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar */}
      <header
        style={{
          backgroundColor: "var(--bg-card)",
          borderBottom: "1px solid var(--border)",
        }}
        className="sticky top-0 z-10 flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2.5">
          <span
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--accent-fg)",
            }}
            className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold"
          >
            T
          </span>
          <span
            style={{ color: "var(--text-1)" }}
            className="text-sm font-semibold"
          >
            TranscriApp
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Main */}
      <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-8">
        {/* Upload card */}
        <section
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
          className="rounded-2xl p-5 space-y-5"
        >
          <div>
            <h1
              style={{ color: "var(--text-1)" }}
              className="text-base font-semibold"
            >
              Transcripción de sesión
            </h1>
            <p style={{ color: "var(--text-2)" }} className="mt-0.5 text-xs">
              mp3 · wav · m4a · webm — hasta 60 min
            </p>
          </div>

          <UploadForm disabled={isBusy} onSubmit={handleTranscribe} />

          <div
            style={{ borderTop: "1px solid var(--border)" }}
            className="pt-4"
          >
            <ProcessingOptions
              value={options}
              onChange={setOptions}
              disabled={isBusy}
            />
          </div>
        </section>

        {/* Progress */}
        {status !== "idle" && (
          <section
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
            className="rounded-2xl px-5 py-4"
          >
            <ProgressBar
              status={progressStatus}
              message={STATUS_LABEL[status]}
            />
          </section>
        )}

        {/* Error fatal */}
        {status === "error" && errorMessage && (
          <div
            style={{
              backgroundColor: "var(--error-bg)",
              border: "1px solid var(--error-border)",
              color: "var(--error-text)",
            }}
            className="rounded-2xl px-4 py-3 text-sm"
          >
            {errorMessage}
          </div>
        )}

        {/* Result */}
        {result && status === "complete" && (
          <>
            {/* Warning de post-proceso fallido */}
            {errorMessage && (
              <div
                style={{
                  backgroundColor: "var(--warn-bg)",
                  border: "1px solid var(--warn-border)",
                  color: "var(--warn-text)",
                }}
                className="rounded-2xl px-4 py-3 text-sm"
              >
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
    </div>
  );
}

async function safeJson(r: Response): Promise<{ error?: string } | null> {
  try {
    return (await r.json()) as { error?: string };
  } catch {
    return null;
  }
}

function toMsg(e: unknown): string {
  return e instanceof Error ? e.message : "Error desconocido.";
}
