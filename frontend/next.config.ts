import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Fix the workspace root detection warning (multiple lockfiles)
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
