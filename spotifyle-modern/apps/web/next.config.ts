import type { NextConfig } from "next";

// Validate environment variables at build time
import './src/lib/init-env';

const nextConfig: NextConfig = {
  // Experimental features
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['@spotifyle/database'],
  },
  
  // Strict mode for better development experience
  reactStrictMode: true,
  
  // Disable x-powered-by header for security
  poweredByHeader: false,
  
  // Configure allowed domains for images
  images: {
    domains: [
      'i.scdn.co', // Spotify CDN
      'api.dicebear.com', // Avatar placeholders
    ],
  },
};

export default nextConfig;
