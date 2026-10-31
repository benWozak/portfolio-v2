// src/app/(app)/sitemap.ts
import type { MetadataRoute } from 'next'
import { getProjects } from '@/lib/projects'

const BASE_URL = 'https://benwozak.dev'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/projects/professional', '/projects/personal', '/contact'].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }))

  return [
    ...staticRoutes,
    ...getProjects().map((project) => ({
      url: `${BASE_URL}/projects/${project.slug}`,
      lastModified: project.updatedAt ? new Date(project.updatedAt) : new Date(),
    })),
  ]
}
