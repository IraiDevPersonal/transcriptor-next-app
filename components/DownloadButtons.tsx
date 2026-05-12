"use client";

import type { TranscriptionResult } from "@/types/transcription";

interface DownloadButtonsProps {
  result: TranscriptionResult;
  processedText?: string;
  summary?: string | null;
}

export function DownloadButtons({ result, processedText, summary }: DownloadButtonsProps) {
  const baseName = stripExtension(result.fileName) || "transcripcion";
  const textToExport = processedText || result.fullText;
  const markdownToExport = buildExportMarkdown(result, processedText, summary);

  function handleDownload(content: string, extension: string, mime: string) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${baseName}.${extension}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <button
        type="button"
        onClick={() =>
          handleDownload(textToExport, "txt", "text/plain;charset=utf-8")
        }
        className="flex-1 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
      >
        Descargar .txt
      </button>
      <button
        type="button"
        onClick={() =>
          handleDownload(markdownToExport, "md", "text/markdown;charset=utf-8")
        }
        className="flex-1 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
      >
        Descargar .md
      </button>
    </div>
  );
}

function buildExportMarkdown(
  result: TranscriptionResult,
  processedText?: string,
  summary?: string | null,
): string {
  const sections: string[] = [
    `# Transcripción\n\n## Archivo\n${result.fileName}\n\n## Fecha\n${result.date}`,
  ];

  if (summary) {
    sections.push(`---\n\n## Resumen Clínico\n\n${summary}`);
  }

  if (processedText) {
    sections.push(`---\n\n## Transcripción Procesada\n\n${processedText}`);
    sections.push(`---\n\n## Transcripción Original\n\n${result.fullText}`);
  } else {
    sections.push(`---\n\n## Contenido\n\n${result.fullText}`);
  }

  return sections.join("\n\n");
}

function stripExtension(name: string): string {
  const idx = name.lastIndexOf(".");
  return idx > 0 ? name.slice(0, idx) : name;
}
