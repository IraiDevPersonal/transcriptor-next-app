"use client";

import type { PostProcessOptions } from "@/types/transcription";

interface ProcessingOptionsProps {
  value: PostProcessOptions;
  onChange: (options: PostProcessOptions) => void;
  disabled: boolean;
}

const OPTIONS: {
  key: keyof PostProcessOptions;
  label: string;
  description: string;
}[] = [
  {
    key: "fixPunctuation",
    label: "Corregir puntuación y ortografía",
    description: "Añade puntos, comas y mayúsculas correctas al texto.",
  },
  {
    key: "separateSpeakers",
    label: 'Separar hablantes ("Paciente", "Psicóloga")',
    description: "Identifica y etiqueta los turnos de cada participante.",
  },
  {
    key: "cleanupFillers",
    label: "Ordenar ideas y limpiar muletillas",
    description: 'Elimina "eh", "mmm", repeticiones y ruido verbal.',
  },
  {
    key: "clinicalSummary",
    label: "Hacer resumen clínico/temático",
    description: "Genera un resumen estructurado de la sesión.",
  },
];

export function ProcessingOptions({
  value,
  onChange,
  disabled,
}: ProcessingOptionsProps) {
  function toggle(key: keyof PostProcessOptions) {
    onChange({ ...value, [key]: !value[key] });
  }

  const anyChecked = Object.values(value).some(Boolean);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
        Opciones de procesamiento
        {anyChecked && (
          <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">
            (se aplican tras transcribir)
          </span>
        )}
      </p>
      <div className="space-y-2">
        {OPTIONS.map(({ key, label, description }) => (
          <label
            key={key}
            className={`flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 transition ${
              value[key]
                ? "border-slate-900 bg-slate-50 dark:border-white dark:bg-slate-800"
                : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
            } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <input
              type="checkbox"
              checked={value[key]}
              disabled={disabled}
              onChange={() => toggle(key)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-slate-900 dark:accent-white"
            />
            <div>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {label}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {description}
              </p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
