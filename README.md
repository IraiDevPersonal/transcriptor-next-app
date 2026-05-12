# Transcriptor de Audio

App Next.js para transcribir audios largos (hasta ~50 min) usando Groq Speech-to-Text (`whisper-large-v3-turbo`). Permite descargar el resultado como `.txt` o `.md`.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Groq API (SDK compatible OpenAI)
- FFmpeg (`ffmpeg-static` + `fluent-ffmpeg`)
- Formidable para upload streaming
- Runtime Node.js

## Instalación

```bash
pnpm install
cp .env.local.example .env.local
# editar .env.local y poner GROQ_API_KEY
pnpm dev
```

Luego abrir [http://localhost:3000](http://localhost:3000).

## Flujo

1. Frontend sube el archivo a `/api/transcribe`.
2. La API guarda el archivo en `temp/uploads` (via formidable).
3. Valida formato (mp3/wav/m4a/webm) y duración (≤ 60 min).
4. FFmpeg divide el audio en chunks de 10 min en `temp/chunks/job_*`.
5. Cada chunk se envía secuencialmente a Groq (`whisper-large-v3-turbo`).
6. Se concatenan las transcripciones y se genera markdown con timestamps.
7. Se devuelve el resultado y se limpian los archivos temporales.

## Variables de entorno

`.env.local`

```env
GROQ_API_KEY=tu_api_key
```

## Deploy

Pensado para entornos con sistema de archivos persistente y runtime Node.js (Railway, Render, fly.io, VPS). No optimizado para Vercel (timeouts de funciones y FS efímero).

## Scripts

- `pnpm dev` — servidor de desarrollo
- `pnpm build` — build de producción
- `pnpm start` — servidor de producción
- `pnpm typecheck` — verificación de tipos
