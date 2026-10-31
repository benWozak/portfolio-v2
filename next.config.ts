import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],

    // Optimize image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  },
  experimental: {
    optimizePackageImports: ['@/components'],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            // host matchers take a bare hostname; with a full URL here the
            // redirect never fired
            value: 'v2-benwozak.vercel.app',
          },
        ],
        destination: 'https://www.benwozak.dev/:path*',
        permanent: true,
      },
      { source: '/resume', destination: '/', permanent: true },
      { source: '/blog', destination: '/', permanent: true },
      { source: '/blog/:slug*', destination: '/', permanent: true },
      { source: '/projects', destination: '/projects/professional', permanent: true },
      { source: '/projects/web', destination: '/projects/professional', permanent: true },
      { source: '/projects/native', destination: '/projects/personal', permanent: true },
    ]
  },
};

export default nextConfig;
