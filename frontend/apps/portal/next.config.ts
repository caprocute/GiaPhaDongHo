import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: "standalone",
  // Monorepo: trace deps từ frontend/ thay vì chỉ apps/portal
  outputFileTracingRoot: path.join(appDir, "../.."),
  transpilePackages: [
    "@giapha/ui",
    "@giapha/tokens",
    "@giapha/lunar",
    "@giapha/tree-viz",
    "@giapha/auth",
  ],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
