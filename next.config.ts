import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const isVercel = process.env.VERCEL === "1";

const nextConfig: NextConfig = {
  basePath,
  experimental: {
    typedRoutes: true
  }
};

if (!isVercel) {
  nextConfig.output = "standalone";
}

export default nextConfig;
