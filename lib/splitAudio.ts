import path from "node:path";
import fs from "node:fs/promises";
import { configureFfmpeg, probeDuration } from "./ffmpeg";

export interface AudioChunk {
  index: number;
  filePath: string;
  startSec: number;
  durationSec: number;
}

const CHUNK_DURATION_SEC = 5 * 60;

export async function splitAudioIntoChunks(
  inputPath: string,
  outputDir: string,
): Promise<AudioChunk[]> {
  await fs.mkdir(outputDir, { recursive: true });

  const totalDuration = await probeDuration(inputPath);
  if (!totalDuration || totalDuration <= 0) {
    throw new Error("No se pudo determinar la duración del audio.");
  }

  const chunks: AudioChunk[] = [];
  let index = 0;

  for (let start = 0; start < totalDuration; start += CHUNK_DURATION_SEC) {
    const duration = Math.min(CHUNK_DURATION_SEC, totalDuration - start);
    const chunkFile = path.join(outputDir, `chunk_${String(index).padStart(3, "0")}.mp3`);

    await extractChunk(inputPath, chunkFile, start, duration);

    chunks.push({
      index,
      filePath: chunkFile,
      startSec: start,
      durationSec: duration,
    });

    index += 1;
  }

  return chunks;
}

function extractChunk(
  inputPath: string,
  outputPath: string,
  startSec: number,
  durationSec: number,
): Promise<void> {
  const ffmpeg = configureFfmpeg();
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setStartTime(startSec)
      .duration(durationSec)
      .audioCodec("libmp3lame")
      .audioBitrate("96k")
      .audioChannels(1)
      .audioFrequency(16000)
      .format("mp3")
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .save(outputPath);
  });
}
