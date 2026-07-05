import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      // Limit Turbopack memory usage
      memoryLimit: 512 * 1024 * 1024, // 512 MB max for Turbopack
    },
  },
  turbopack: {
    // Fix the workspace root detection warning (multiple lockfiles)
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
