import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ... process.env.USEDOCKER === 'true' ? {
    outputFileTracingRoot: '/app', // Important for Docker builds
    output: 'standalone',
} : {},
};

export default nextConfig;
