"use client";

import { useState } from "react";
import type { TranscriptionResult } from "@/types/transcription";

interface Props {
  result: TranscriptionResult;
  processedText?: string;
  summary?: string | null;
}

type Tab = "raw" | "processed" | "summary";

export function ResultCard({ result, processedText, summary }: Props) {
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
    } catch { /* ignorar */ }
  }

  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: "raw", label: "Original", show: true },
    { id: "processed", label: "Procesado", show: hasProcessed },
    { id: "summary", label: "Resumen clínico", show: hasSummary },
  ];

  return (
    <div
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
      className="overflow-hidden rounded-2xl"
    >
      {/* Header */}
      <div
        style={{ borderBottom: "1px solid var(--border)" }}
        className="flex items-center justify-between gap-3 px-4 py-3"
      >
        <div className="min-w-0">
          <p style={{ color: "var(--text-1)" }} className="truncate text-sm font-semibold">
            {result.fileName}
          </p>
          {result.durationSec > 0 && (
            <p style={{ color: "var(--text-3)" }} className="text-xs">
              {formatDuration(result.durationSec)}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            backgroundColor: copied ? "var(--accent)" : "var(--bg-subtle)",
            border: "1px solid var(--border-strong)",
            color: copied ? "var(--accent-fg)" : "var(--text-2)",
          }}
          className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150"
        >
          {copied ? "¡Copiado!" : "Copiar"}
        </button>
      </div>

      {/* Tabs */}
      {(hasProcessed || hasSummary) && (
        <div
          style={{ borderBottom: "1px solid var(--border)" }}
          className="flex gap-0"
        >
          {tabs.filter((t) => t.show).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                color: activeTab === tab.id ? "var(--text-1)" : "var(--text-3)",
                borderBottom: activeTab === tab.id
                  ? "2px solid var(--accent)"
                  : "2px solid transparent",
              }}
              className="px-4 py-2.5 text-xs font-medium transition-all duration-150 hover:opacity-80"
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div
        style={{
          backgroundColor: "var(--bg-result)",
          color: "var(--text-1)",
        }}
        className="max-h-96 overflow-y-auto whitespace-pre-wrap p-4 text-sm leading-relaxed"
      >
        {displayText || (
          <span style={{ color: "var(--text-3)" }}>Sin contenido.</span>
        )}
      </div>
    </div>
  );
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}m ${String(s).padStart(2, "0")}s`;
}
