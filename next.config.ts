import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["fluent-ffmpeg", "ffmpeg-static", "ffprobe-static"],
  experimental: {
    serverActions: {
      bodySizeLimit: "500mb",
    },
  },
};

export default nextConfig;
