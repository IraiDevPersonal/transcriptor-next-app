import OpenAI from "openai";
import { envs } from "./envs";

let cachedClient: OpenAI | null = null;

export function getGroqClient(): OpenAI {
  if (cachedClient) return cachedClient;

  const apiKey = envs.groq.apiKey;
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY no está configurado en las variables de entorno.",
    );
  }

  cachedClient = new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });

  return cachedClient;
}

export const GROQ_TRANSCRIPTION_MODEL = "whisper-large-v3-turbo";
