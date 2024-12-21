/** @type {import('next').NextConfig} */

const nextConfig = {
  ... process.env.USEDOCKER === 'true' ? {
      outputFileTracingRoot: '/app', // Important for Docker builds
      output: 'standalone',
  } : {},
};

export default nextConfig;