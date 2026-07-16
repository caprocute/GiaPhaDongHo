import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
