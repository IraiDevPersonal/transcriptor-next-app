"use client";

import { useState } from "react";
import type { TranscriptionResult } from "@/types/transcription";

interface ResultCardProps {
  result: TranscriptionResult;
}

export function ResultCard({ result }: ResultCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(result.fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Transcripción
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {result.fileName} · {formatDuration(result.durationSec)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {copied ? "¡Copiado!" : "Copiar"}
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-sm leading-relaxed text-slate-800 dark:bg-slate-950 dark:text-slate-200">
        {result.fullText || "Sin contenido."}
      </div>
    </div>
  );
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}m ${String(s).padStart(2, "0")}s`;
}
