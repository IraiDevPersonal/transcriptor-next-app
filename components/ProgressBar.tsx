"use client";

import type { TranscriptionStatus } from "@/types/transcription";

interface ProgressBarProps {
  status: TranscriptionStatus;
  message?: string;
}

const LABELS: Record<TranscriptionStatus, string> = {
  idle: "Listo",
  uploading: "Subiendo archivo...",
  processing: "Dividiendo y transcribiendo...",
  complete: "Completado",
  error: "Error",
};

export function ProgressBar({ status, message }: ProgressBarProps) {
  if (status === "idle") return null;

  const animated = status === "uploading" || status === "processing";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
        <span>{message ?? LABELS[status]}</span>
        {animated && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Esto puede tardar varios minutos
          </span>
        )}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className={`h-full ${
            status === "error"
              ? "w-full bg-red-500"
              : status === "complete"
                ? "w-full bg-emerald-500"
                : "w-1/3 animate-pulse bg-slate-900 dark:bg-white"
          }`}
        />
      </div>
    </div>
  );
}
