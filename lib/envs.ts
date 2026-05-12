import z from "zod";

const envSchema = z.object({
  GROQ_API_KEY: z.string().min(1),
  CHUNK_DURATION_MIN: z.coerce.number().optional().default(5),
});

function parseEnvs() {
  const { data, success, error } = envSchema.safeParse(process.env);

  if (!success) {
    const errorMessage = error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");
    throw new Error("Error parsing environment variables: " + errorMessage);
  }

  return {
    groq: {
      apiKey: data.GROQ_API_KEY,
    },
    audio: {
      chunkDurationMin: data.CHUNK_DURATION_MIN,
    },
  };
}

export const envs = parseEnvs();
