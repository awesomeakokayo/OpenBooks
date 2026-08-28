import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Prisma to be external on server
  serverExternalPackages: ["@prisma/client"],
  // Workaround for Vercel Turbopack font import map: force webpack for font handling
  // Next 16 uses Turbopack by default; this keeps build stable on Vercel
  turbopack: {},
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
