import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
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

// Uncached single-post fetch (used directly in draft mode, cached otherwise)
async function fetchPostBySlug(slug: string, draft: boolean): Promise<Blog | undefined> {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'blog' as any,
    where: draft
      ? { slug: { equals: slug } }
      : {
          and: [
            { slug: { equals: slug } },
            // The Local API bypasses access control (overrideAccess defaults
            // to true), so drafts must be filtered out explicitly here.
            { status: { equals: 'published' } },
          ],
        },
    draft,
    limit: 1,
  })
  return docs[0] as Blog | undefined
}

const getCachedPostBySlug = unstable_cache(
  async (slug: string): Promise<Blog | undefined> => fetchPostBySlug(slug, false),
  ['post-by-slug'],
  { tags: ['blog-data'], revalidate: 3600 },
)

export async function getPostBySlug(slug: string, isDraftMode?: boolean): Promise<Blog | undefined> {
  let shouldUseDraft = false
  if (isDraftMode !== undefined) {
    shouldUseDraft = isDraftMode
  } else {
    try {
      const { isEnabled } = await draftMode()
      shouldUseDraft = isEnabled
    } catch {
      // outside a request context (e.g. scripts) — default to published-only
      shouldUseDraft = false
    }
  }

  // Draft mode bypasses the cache and the published filter so drafts preview
  if (shouldUseDraft) {
    return fetchPostBySlug(slug, true)
  }

  return getCachedPostBySlug(slug)
}
