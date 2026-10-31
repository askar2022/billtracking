import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This is a private, authenticated bookkeeping app. Every screen
  // reads the session and live ledger data, so prerender caching is off.
  cacheComponents: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
