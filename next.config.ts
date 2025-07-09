import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['ua4mmiw8i4jbla3y.public.blob.vercel-storage.com'],
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
