"use client";

import type { TranscriptionStatus } from "@/types/transcription";

interface Props {
  status: TranscriptionStatus;
  message?: string;
}

const LABELS: Record<TranscriptionStatus, string> = {
  idle: "",
  uploading: "Subiendo archivo…",
  processing: "Transcribiendo audio…",
  complete: "Completado",
  error: "Error",
};

export function ProgressBar({ status, message }: Props) {
  if (status === "idle") return null;

  const isActive = status === "uploading" || status === "processing";
  const isError = status === "error";
  const isDone = status === "complete";

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span
          style={{ color: isError ? "var(--error-text)" : "var(--text-1)" }}
          className="text-sm font-medium"
        >
          {message ?? LABELS[status]}
        </span>
        {isActive && (
          <span style={{ color: "var(--text-3)" }} className="text-xs">
            Esto puede tardar varios minutos…
          </span>
        )}
        {isDone && (
          <span style={{ color: "var(--accent)" }} className="text-xs font-medium">
            ✓
          </span>
        )}
      </div>

      <div
        style={{ backgroundColor: "var(--progress-track)" }}
        className="h-1 w-full overflow-hidden rounded-full"
      >
        <div
          style={{
            backgroundColor: isError
              ? "var(--error-border)"
              : isDone
                ? "var(--accent)"
                : "var(--progress-fill)",
            width: isActive ? "40%" : "100%",
          }}
          className={`h-full rounded-full transition-all duration-500 ${
            isActive ? "animate-pulse" : ""
          }`}
        />
      </div>
    </div>
  );
}
