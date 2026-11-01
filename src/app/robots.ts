import { headers } from 'next/headers'
import { SITE_URL } from '@/lib/site'

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
      host: SITE_URL,
    }
  }
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}