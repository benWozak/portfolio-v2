import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import configPromise from '../payload.config'
import type { Blog } from '@/payload-types'
import type { BlogPage } from '@/types/blogPage'

export const getBlogPageConfig = unstable_cache(
  async (): Promise<BlogPage | undefined> => {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'blogPage' as any,
      limit: 1,
    })
    return docs[0] as BlogPage | undefined
  },
  ['blog-page-config'],
  { tags: ['blog-data'], revalidate: 3600 },
)

export const getPublishedPosts = unstable_cache(
  async (): Promise<Blog[]> => {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'blog' as any,
      where: {
        status: {
          equals: 'published',
        },
      },
      sort: '-publishedAt',
      limit: 50,
    })
    return docs as Blog[]
  },
  ['published-posts'],
  { tags: ['blog-data'], revalidate: 3600 },
)

export const getPostBySlug = unstable_cache(
  async (slug: string): Promise<Blog | undefined> => {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'blog' as any,
      where: {
        and: [
          { slug: { equals: slug } },
          // The Local API bypasses access control (overrideAccess defaults to
          // true), so drafts must be filtered out explicitly here.
          { status: { equals: 'published' } },
        ],
      },
      limit: 1,
    })
    return docs[0] as Blog | undefined
  },
  ['post-by-slug'],
  { tags: ['blog-data'], revalidate: 3600 },
)
