/** @type {import('next').NextConfig} */

const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  // TypeScript configuration for build
  typescript: {
    // Allow build to complete even with type errors in production
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },

  // Server external packages (moved from experimental)
  serverExternalPackages: ['pg', '@aws-sdk/client-s3'],
  
  // Docker-specific configuration
  ... process.env.USEDOCKER === 'true' ? {
      outputFileTracingRoot: '/app',
  } : {},
};

export default nextConfig;