import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: path.join(__dirname, "../../"),
  },
  experimental: {
    agentUpgrade: "security",
  },
};

export default nextConfig;

