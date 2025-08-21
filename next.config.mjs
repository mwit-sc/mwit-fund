/** @type {import('next').NextConfig} */

const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  // TypeScript configuration for build
  typescript: {
    // Allow build to complete even with type errors in production
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  
  // ESLint configuration
  eslint: {
    // Allow build to complete even with ESLint errors in production
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  
  // Experimental features
  experimental: {
    // Enable server components optimization
    serverComponentsExternalPackages: ['pg', '@aws-sdk/client-s3'],
  },
  
  // Docker-specific configuration
  ... process.env.USEDOCKER === 'true' ? {
      outputFileTracingRoot: '/app',
  } : {},
};

export default nextConfig;