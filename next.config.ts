import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Optimize for production */
  output: 'standalone', // Optimized for containerized deployments
  poweredByHeader: false, // Remove X-Powered-By header for security
  compress: true, // Enable compression
  images: {
    domains: ['source.unsplash.com'], // Allow Unsplash as fallback image source
    formats: ['image/webp', 'image/avif'], // Use modern image formats
  },
  reactStrictMode: true, // Highlight potential problems in React code
};

export default nextConfig;
