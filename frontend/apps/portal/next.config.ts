import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@giapha/ui",
    "@giapha/tokens",
    "@giapha/lunar",
    "@giapha/tree-viz",
    "@giapha/auth",
  ],
};

export default nextConfig;
