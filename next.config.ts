import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Prisma to be external on server
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
