/** @type {import('next').NextConfig} */

// Backend URL for API proxying in development
// - In Docker Compose: use 'http://app:8080' (internal service name)
// - Local development: use 'http://localhost:8001' (external port) or 'http://localhost:8080'
const backendUrl = process.env.BACKEND_URL || 'http://localhost:8001';

const nextConfig = {
  // Only use static export for production builds
  ...(process.env.NODE_ENV === 'production' ? { output: 'export' } : {}),
  distDir: 'out',
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Proxy API requests to backend during development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/health/:path*',
        destination: `${backendUrl}/health/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
