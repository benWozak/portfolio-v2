import type { CollectionBeforeChangeHook } from 'payload'

// Helper function to extract text content from Lexical editor state
function extractTextFromLexical(content: any): string {
  if (!content) {
    return ''
  }

  // Handle different content structures
  let contentData = content
  if (typeof content === 'string') {
    try {
      contentData = JSON.parse(content)
    } catch {
      return content // Return as-is if not valid JSON
    }
  }

  if (!contentData.root || !contentData.root.children) {
    return ''
  }

  let text = ''
  
  function traverseNode(node: any): void {
    if (node.text) {
      text += node.text + ' '
    }
    
    if (node.children) {
      node.children.forEach(traverseNode)
    }
  }
  
  contentData.root.children.forEach(traverseNode)
  return text.trim()
}

// Helper function to generate URL-friendly slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

// Helper function to ensure unique slug
async function ensureUniqueSlug(slug: string, docId: string | undefined, req: any): Promise<string> {
  let uniqueSlug = slug
  let counter = 1
  
  while (true) {
    const existingDoc = await req.payload.find({
      collection: 'blog',
      where: {
        and: [
          { slug: { equals: uniqueSlug } },
          ...(docId ? [{ id: { not_equals: docId } }] : [])
        ]
      },
      limit: 1
    })
    
    if (existingDoc.docs.length === 0) {
      break
    }
    
    uniqueSlug = `${slug}-${counter}`
    counter++
  }
  
  return uniqueSlug
}

export const blogBeforeChangeHook: CollectionBeforeChangeHook = async ({
  data,
  req,
  // operation,
  originalDoc,
}) => {
  // Auto-generate excerpt from content (first 300 characters)
  if (data.content && !data.excerpt) {
    const textContent = extractTextFromLexical(data.content)
    if (textContent) {
      data.excerpt = textContent.substring(0, 300)
      if (textContent.length > 300) {
        data.excerpt += '...'
      }
    }
  }
  
  // Auto-generate slug from title
  if (data.title && !data.slug) {
    const baseSlug = generateSlug(data.title)
    data.slug = await ensureUniqueSlug(baseSlug, originalDoc?.id, req)
  }
  
  // Auto-populate SEO metadata
  if (!data.seo) {
    data.seo = {}
  }
  
  // Auto-generate meta title if not provided
  if (data.title && !data.seo.metaTitle) {
    data.seo.metaTitle = `${data.title} | Ben Wozak`
  }
  
  // Auto-generate meta description from excerpt if not provided
  if (data.excerpt && !data.seo.metaDescription) {
    // Remove any trailing "..." from excerpt for meta description
    const cleanExcerpt = data.excerpt.replace(/\.\.\.$/g, '')
    data.seo.metaDescription = cleanExcerpt
  }
  
  // Auto-set OG image from featured image if not provided
  if (data.featuredImage && !data.seo.ogImage) {
    data.seo.ogImage = data.featuredImage
  }
  
  return data
}