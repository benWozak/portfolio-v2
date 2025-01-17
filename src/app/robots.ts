import { headers } from 'next/headers'

export default async function robots() {
  const headersList = await headers();
  const isVercelDomain = headersList.get('host')?.includes('vercel.app');
  
  if (isVercelDomain) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
      host: 'https://benwozak.dev',
    }
  }
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: 'https://benwozak.dev/sitemap.xml',
  }
}