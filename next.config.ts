import type { NextConfig } from "next";

/**
 * Production deploy (Hostinger, etc.): leave NEXT_PUBLIC_BASE_PATH unset so the site
 * lives at the domain root. Only set NEXT_PUBLIC_BASE_PATH if you intentionally host
 * under a subfolder (e.g. /blog) — must match that folder on the server.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") ?? "";

const nextConfig: NextConfig = {
  output: "export",
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
};

export default nextConfig;
