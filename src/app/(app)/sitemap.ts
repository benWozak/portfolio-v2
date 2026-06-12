import type { MetadataRoute } from 'next'
import { getPublishedPosts } from '@/utils/getBlog'
import { getProjects } from '@/utils/getProjects'

const BASE_URL = 'https://benwozak.dev'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    '',
    '/projects',
    '/projects/web',
    '/projects/native',
    '/blog',
    '/resume',
    '/contact',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }))

  // Never fail the build over a sitemap data fetch
  const [projects, posts] = await Promise.all([
    getProjects().catch(() => []),
    getPublishedPosts().catch(() => []),
  ])

  return [
    ...staticRoutes,
    ...projects.map((project) => ({
      url: `${BASE_URL}/projects/${project.slug}`,
      lastModified: new Date(),
    })),
    ...posts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
    })),
  ]
}
