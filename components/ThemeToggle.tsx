"use client";

import { useTheme } from "@/providers/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isRose = theme === "rose";

  return (
    <button
      type="button"
      onClick={toggle}
      title={isRose ? "Cambiar a tema oscuro" : "Cambiar a tema rosa"}
      style={{
        backgroundColor: "var(--bg-subtle)",
        border: "1px solid var(--border)",
        color: "var(--text-2)",
      }}
      className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:opacity-80"
    >
      <span
        style={{ backgroundColor: "var(--accent)" }}
        className="h-2 w-2 rounded-full"
      />
      {isRose ? "Rosa" : "Oscuro"}
    </button>
  );
}
