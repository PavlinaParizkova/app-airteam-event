import type { NextConfig } from "next";
import path from "path";

const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
  async headers() {
    const noCache = [
      {
        key: "Cache-Control",
        value: "private, no-cache, no-store, max-age=0, must-revalidate",
      },
    ] as const;
    return [
      { source: "/", headers: [...noCache] },
      { source: "/(.*)", headers: [...noCache] },
    ];
  },
};

export default nextConfig;
