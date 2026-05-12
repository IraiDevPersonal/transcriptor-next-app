"use client";

import type { TranscriptionResult } from "@/types/transcription";

interface Props {
  result: TranscriptionResult;
  processedText?: string;
  summary?: string | null;
}

export function DownloadButtons({ result, processedText, summary }: Props) {
  const baseName = stripExtension(result.fileName) || "transcripcion";
  const textToExport = processedText || result.fullText;
  const markdownToExport = buildExportMarkdown(result, processedText, summary);

  function download(content: string, ext: string, mime: string) {
    const url = URL.createObjectURL(new Blob([content], { type: mime }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baseName}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex gap-2">
      <DownloadBtn
        label=".txt"
        onClick={() => download(textToExport, "txt", "text/plain;charset=utf-8")}
      />
      <DownloadBtn
        label=".md"
        onClick={() => download(markdownToExport, "md", "text/markdown;charset=utf-8")}
      />
    </div>
  );
}

function DownloadBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        backgroundColor: "var(--bg-subtle)",
        border: "1px solid var(--border-strong)",
        color: "var(--text-2)",
      }}
      className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-all duration-150 hover:opacity-80 active:scale-[0.99]"
    >
      Descargar{" "}
      <span style={{ color: "var(--accent)" }} className="font-semibold">
        {label}
      </span>
    </button>
  );
}

function buildExportMarkdown(
  result: TranscriptionResult,
  processedText?: string,
  summary?: string | null,
): string {
  const parts = [
    `# Transcripción\n\n## Archivo\n${result.fileName}\n\n## Fecha\n${result.date}`,
  ];
  if (summary) parts.push(`---\n\n## Resumen Clínico\n\n${summary}`);
  if (processedText) {
    parts.push(`---\n\n## Transcripción Procesada\n\n${processedText}`);
    parts.push(`---\n\n## Transcripción Original\n\n${result.fullText}`);
  } else {
    parts.push(`---\n\n## Contenido\n\n${result.fullText}`);
  }
  return parts.join("\n\n");
}

function stripExtension(name: string): string {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.slice(0, i) : name;
}
