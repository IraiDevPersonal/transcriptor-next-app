import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";

let configured = false;

export function configureFfmpeg(): typeof ffmpeg {
  if (!configured) {
    const binaryPath = ffmpegStatic as unknown as string | null;
    if (binaryPath) {
      ffmpeg.setFfmpegPath(binaryPath);
    }
    configured = true;
  }
  return ffmpeg;
}

export function probeDuration(filePath: string): Promise<number> {
  const f = configureFfmpeg();
  return new Promise((resolve, reject) => {
    f.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }
      const duration = metadata?.format?.duration ?? 0;
      resolve(typeof duration === "number" ? duration : 0);
    });
  });
}
