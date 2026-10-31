import type { CollectionBeforeChangeHook } from 'payload'
import { ensureUniqueSlug, generateSlug } from './slug'

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
    data.slug = await ensureUniqueSlug('blog', baseSlug, originalDoc?.id, req)
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