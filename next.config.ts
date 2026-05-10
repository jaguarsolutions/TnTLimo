import type { NextConfig } from "next";

/**
 * Optional sub-path hosting (e.g. tnttours.com/something) — set NEXT_PUBLIC_BASE_PATH.
 * For root-domain hosting on Vercel, leave it unset.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") ?? "";

const nextConfig: NextConfig = {
  // Static export was used for the Hostinger fallback. With API routes (Stripe,
  // bookings, refunds) and a Postgres database we now need a server runtime, so
  // the app deploys as a normal Next.js application on Vercel.
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
};

export default nextConfig;
