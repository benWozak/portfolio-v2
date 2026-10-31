// src/app/(app)/sitemap.ts
import type { MetadataRoute } from 'next'
import { getPublishedPosts } from '@/utils/getBlog'
import { getProjects } from '@/lib/projects'

const BASE_URL = 'https://benwozak.dev'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    '',
    '/projects',
    '/projects/web',
    '/projects/native',
    '/blog',
    '/contact',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }))

  const projects = getProjects()

  // Never fail the build over a sitemap data fetch
  const posts = await getPublishedPosts().catch(() => [])

  return [
    ...staticRoutes,
    ...projects.map((project) => ({
      url: `${BASE_URL}/projects/${project.slug}`,
      lastModified: project.updatedAt ? new Date(project.updatedAt) : new Date(),
    })),
    ...posts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
    })),
  ]
}
