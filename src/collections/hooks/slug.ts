// Helper function to generate URL-friendly slug
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

// Helper function to ensure unique slug within a collection
export async function ensureUniqueSlug(
  collection: 'blog' | 'projects',
  slug: string,
  docId: string | number | undefined,
  req: any,
): Promise<string> {
  let uniqueSlug = slug
  let counter = 1

  while (true) {
    const existingDoc = await req.payload.find({
      collection,
      where: {
        and: [
          { slug: { equals: uniqueSlug } },
          ...(docId ? [{ id: { not_equals: docId } }] : []),
        ],
      },
      limit: 1,
      req,
    })

    if (existingDoc.docs.length === 0) {
      break
    }

    uniqueSlug = `${slug}-${counter}`
    counter++
  }

  return uniqueSlug
}
