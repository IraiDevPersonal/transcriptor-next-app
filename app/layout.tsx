import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Transcriptor de Audio",
  description: "Sube audios largos y obtén la transcripción en .txt o .md.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
