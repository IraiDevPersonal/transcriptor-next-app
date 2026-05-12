import type { Metadata } from "next";
import { ThemeProvider } from "@/providers/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Transcriptor de Audio",
  description: "Transcribe sesiones de audio a texto con IA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-theme="default" suppressHydrationWarning>
      <head>
        {/* Anti-FOUC: aplica el tema guardado antes de que React hidrate */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme')||'default';document.documentElement.setAttribute('data-theme',t);})();`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
