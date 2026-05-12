"use client";

import { useState } from "react";
import type { TranscriptionResult } from "@/types/transcription";

interface ResultCardProps {
  result: TranscriptionResult;
  processedText?: string;
  summary?: string | null;
}

type Tab = "raw" | "processed" | "summary";

export function ResultCard({ result, processedText, summary }: ResultCardProps) {
  const hasProcessed = !!processedText;
  const hasSummary = !!summary;

  const [activeTab, setActiveTab] = useState<Tab>(
    hasProcessed ? "processed" : "raw",
  );
  const [copied, setCopied] = useState(false);

  const displayText =
    activeTab === "processed" && hasProcessed
      ? processedText
      : activeTab === "summary" && hasSummary
        ? summary
        : result.fullText;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(displayText ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: "raw", label: "Transcripción", show: true },
    { id: "processed", label: "Procesado", show: hasProcessed },
    { id: "summary", label: "Resumen clínico", show: hasSummary },
  ];

  return (
    <div className="space-y-3 rounded-2xl border border-rose-500 bg-rose-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-rose-700">Resultado</h2>
          <p className="text-xs text-rose-400 dark:text-slate-400">
            {result.fileName}
            {result.durationSec > 0 && ` · ${formatDuration(result.durationSec)}`}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-md border border-rose-500 px-3 py-1.5 text-xs font-medium text-rose-500 bg-transparent transition hover:text-rose-100 hover:bg-rose-500"
        >
          {copied ? "¡Copiado!" : "Copiar"}
        </button>
      </div>

      {(hasProcessed || hasSummary) && (
        <div className="flex gap-1 border-b border-rose-200">
          {tabs
            .filter((t) => t.show)
            .map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium transition ${
                  activeTab === tab.id
                    ? "border-b-2 border-rose-500 text-rose-500"
                    : "text-rose-300 hover:text-rose-500"
                }`}
              >
                {tab.label}
              </button>
            ))}
        </div>
      )}

      <div className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-md bg-rose-100 p-3 text-sm leading-relaxed text-rose-700">
        {displayText || "Sin contenido."}
      </div>
    </div>
  );
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}m ${String(s).padStart(2, "0")}s`;
}
