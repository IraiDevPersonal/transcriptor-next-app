"use client";

import { useRef, useState } from "react";

interface UploadFormProps {
  disabled: boolean;
  onSubmit: (file: File) => void;
}

const ACCEPT = ".mp3,.wav,.m4a,.webm,audio/*";

export function UploadForm({ disabled, onSubmit }: UploadFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (file) onSubmit(file);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="audio-input"
          className="text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          Archivo de audio
        </label>
        <input
          id="audio-input"
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          disabled={disabled}
          onChange={handleFileChange}
          className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:file:bg-slate-800 dark:file:text-slate-100"
        />
        {file && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {file.name} · {formatBytes(file.size)}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={disabled || !file}
        className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
      >
        Transcribir
      </button>
    </form>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
