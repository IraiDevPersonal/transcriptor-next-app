import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ffprobeStatic = require("ffprobe-static") as { path: string };

let configured = false;

export function configureFfmpeg(): typeof ffmpeg {
  if (!configured) {
    const ffmpegPath = ffmpegStatic as unknown as string | null;
    if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath);

    const ffprobePath = ffprobeStatic?.path;
    if (ffprobePath) ffmpeg.setFfprobePath(ffprobePath);

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
