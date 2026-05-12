"use client";

import type { TranscriptionResult } from "@/types/transcription";

interface DownloadButtonsProps {
  result: TranscriptionResult;
}

export function DownloadButtons({ result }: DownloadButtonsProps) {
  const baseName = stripExtension(result.fileName) || "transcripcion";

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
          handleDownload(result.fullText, "txt", "text/plain;charset=utf-8")
        }
        className="flex-1 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
      >
        Descargar .txt
      </button>
      <button
        type="button"
        onClick={() =>
          handleDownload(result.markdown, "md", "text/markdown;charset=utf-8")
        }
        className="flex-1 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
      >
        Descargar .md
      </button>
    </div>
  );
}

function stripExtension(name: string): string {
  const idx = name.lastIndexOf(".");
  return idx > 0 ? name.slice(0, idx) : name;
}
