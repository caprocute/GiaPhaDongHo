import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@giapha/ui", "@giapha/tokens", "@giapha/lunar"],
};

export default nextConfig;
