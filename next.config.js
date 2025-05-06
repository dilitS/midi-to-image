/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint on production build
  eslint: {
    // Warning instead of error in production
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'], // Use modern image formats
  },
  // General optimizations
  poweredByHeader: false, // Remove X-Powered-By header for security
  compress: true, // Enable compression
  reactStrictMode: true, // Highlight potential problems in React code
  swcMinify: true, // Use SWC minifier for better performance
  // Add any other project-specific options below
}

module.exports = nextConfig 