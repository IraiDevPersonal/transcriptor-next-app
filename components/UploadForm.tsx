"use client";

import { useRef, useState } from "react";

interface Props {
  disabled: boolean;
  onSubmit: (file: File) => void;
}

const ACCEPT = ".mp3,.wav,.m4a,.webm,audio/*";

export function UploadForm({ disabled, onSubmit }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (file) onSubmit(file);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* File picker */}
      <div className="space-y-1.5">
        <label
          htmlFor="audio-input"
          style={{ color: "var(--text-2)" }}
          className="block text-xs font-medium uppercase tracking-wider"
        >
          Archivo de audio
        </label>

        <button
          type="button"
          onClick={() => !disabled && inputRef.current?.click()}
          disabled={disabled}
          style={{
            backgroundColor: "var(--bg-input)",
            border: "1px solid var(--border)",
            color: "var(--text-1)",
          }}
          className="group relative flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-all duration-150 hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span
            style={{
              backgroundColor: "var(--bg-subtle)",
              border: "1px solid var(--border-strong)",
              color: "var(--text-2)",
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm"
          >
            ♪
          </span>
          <div className="min-w-0 flex-1">
            {file ? (
              <>
                <p className="truncate text-sm font-medium" style={{ color: "var(--text-1)" }}>
                  {file.name}
                </p>
                <p className="text-xs" style={{ color: "var(--text-2)" }}>
                  {formatBytes(file.size)}
                </p>
              </>
            ) : (
              <p className="text-sm" style={{ color: "var(--text-2)" }}>
                Seleccionar archivo…
              </p>
            )}
          </div>
          {file && (
            <span className="text-xs" style={{ color: "var(--text-3)" }}>
              mp3 · wav · m4a · webm
            </span>
          )}
        </button>

        <input
          id="audio-input"
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          disabled={disabled}
          onChange={handleChange}
          className="sr-only"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={disabled || !file}
        style={{
          backgroundColor: "var(--accent)",
          color: "var(--accent-fg)",
        }}
        className="w-full rounded-xl px-4 py-3 text-sm font-semibold tracking-wide shadow-sm transition-all duration-150 hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Transcribir
      </button>
    </form>
  );
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}
