import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for optimized Docker image
  output: "standalone",

  // Allow images from external CDN domains (EPorner thumbnails)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.eporner.com" },
      { protocol: "https", hostname: "**.eporner.com" },
      { protocol: "https", hostname: "static-eu-cdn.eporner.com" },
      { protocol: "https", hostname: "static-hw.eporner.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    unoptimized: true, // Use CDN URLs as-is, no server-side processing
  },

  // Security & performance headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Tell Cloudflare to cache pages for 4 hours
          { key: "Cache-Control", value: "public, s-maxage=14400, stale-while-revalidate=86400" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
      {
        // API routes should NOT be cached
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
