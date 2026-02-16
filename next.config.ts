import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  logging: {
    incomingRequests: false,
  },
  experimental: {
    // Disable Turbopack filesystem cache - prevents 2700+ .sst files that trigger OneDrive delete prompts
    turbopackFileSystemCacheForDev: false,
    turbopackFileSystemCacheForBuild: false,
  },
};

export default nextConfig;
