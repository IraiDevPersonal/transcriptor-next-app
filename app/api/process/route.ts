import { NextResponse } from "next/server";
import { postProcessTranscription } from "@/lib/postprocess";
import type { PostProcessOptions } from "@/types/transcription";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      text?: string;
      options?: PostProcessOptions;
    };

    const text = body.text?.trim();
    const options = body.options;

    if (!text) {
      return NextResponse.json(
        { error: "El campo 'text' es requerido." },
        { status: 400 },
      );
    }

    if (!options) {
      return NextResponse.json(
        { error: "El campo 'options' es requerido." },
        { status: 400 },
      );
    }

    const result = await postProcessTranscription(text, options);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[process] error:", err);
    const message =
      err instanceof Error ? err.message : "Error al procesar el texto.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
