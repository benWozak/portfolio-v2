import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['ua4mmiw8i4jbla3y.public.blob.vercel-storage.com'],
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
            value: 'https://v2-benwozak.vercel.app/',
          },
        ],
        destination: 'https://www.benwozak.dev/:path*',
        permanent: true,
      },
    ]
  },
};

export default withPayload(nextConfig);
