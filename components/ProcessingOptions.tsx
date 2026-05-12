"use client";

import type { PostProcessOptions } from "@/types/transcription";

interface Props {
  value: PostProcessOptions;
  onChange: (v: PostProcessOptions) => void;
  disabled: boolean;
}

const OPTIONS: { key: keyof PostProcessOptions; label: string; description: string }[] = [
  {
    key: "fixPunctuation",
    label: "Corregir puntuación y ortografía",
    description: "Añade puntos, comas y mayúsculas correctas al texto.",
  },
  {
    key: "separateSpeakers",
    label: "Separar hablantes",
    description: "Etiqueta turnos como «Psicóloga» y «Paciente» usando timestamps.",
  },
  {
    key: "cleanupFillers",
    label: "Limpiar muletillas",
    description: "Elimina «eh», «mmm», repeticiones y ruido verbal.",
  },
  {
    key: "clinicalSummary",
    label: "Resumen clínico",
    description: "Genera un resumen estructurado de la sesión.",
  },
];

export function ProcessingOptions({ value, onChange, disabled }: Props) {
  function toggle(key: keyof PostProcessOptions) {
    onChange({ ...value, [key]: !value[key] });
  }

  return (
    <div className="space-y-3">
      <p
        style={{ color: "var(--text-2)" }}
        className="text-xs font-medium uppercase tracking-wider"
      >
        Procesamiento con IA
      </p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {OPTIONS.map(({ key, label, description }) => {
          const checked = value[key];
          return (
            <label
              key={key}
              style={{
                backgroundColor: checked ? "var(--bg-subtle)" : "var(--bg-input)",
                border: `1px solid ${checked ? "var(--border-strong)" : "var(--border)"}`,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.4 : 1,
              }}
              className="flex items-start gap-3 rounded-xl p-3 transition-all duration-150 hover:opacity-80"
            >
              <span
                style={{
                  backgroundColor: checked ? "var(--accent)" : "transparent",
                  border: `1.5px solid ${checked ? "var(--accent)" : "var(--border-strong)"}`,
                  color: "var(--accent-fg)",
                }}
                className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded text-[10px] font-bold transition-all"
              >
                {checked ? "✓" : ""}
              </span>
              <div className="min-w-0">
                <span
                  style={{ color: "var(--text-1)" }}
                  className="block text-sm font-medium leading-snug"
                >
                  {label}
                </span>
                <span
                  style={{ color: "var(--text-3)" }}
                  className="block text-xs leading-snug"
                >
                  {description}
                </span>
              </div>
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => toggle(key)}
                className="sr-only"
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
