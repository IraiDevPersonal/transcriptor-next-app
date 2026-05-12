"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "rose" | "default";

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx>({ theme: "default", toggle: () => {} });

export function useTheme() {
  return useContext(Ctx);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("default");

  useEffect(() => {
    const saved = (localStorage.getItem("theme") as Theme) ?? "default";
    apply(saved);
    setTheme(saved);
  }, []);

  function toggle() {
    setTheme((prev) => {
      const next: Theme = prev === "rose" ? "default" : "rose";
      apply(next);
      localStorage.setItem("theme", next);
      return next;
    });
  }

  return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>;
}

function apply(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}
