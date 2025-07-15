import { getPayload } from 'payload'
import configPromise from '../../../../payload.config'

export async function POST(request: Request): Promise<Response> {
  const payload = await getPayload({
    config: configPromise,
  })

  try {
    const body = await request.json()
    const { collection, id, slug } = body

    if (!collection || (!id && !slug)) {
      return Response.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    let doc
    
    if (collection === 'projects') {
      if (id) {
        doc = await payload.findByID({
          collection: 'projects' as any,
          id,
          draft: true, // Include draft content
        })
      } else if (slug) {
        const result = await payload.find({
          collection: 'projects' as any,
          where: {
            name: {
              equals: slug,
            },
          },
          draft: true, // Include draft content
        })
        doc = result.docs[0]
      }
    } else if (collection === 'resume') {
      if (id) {
        doc = await payload.findByID({
          collection: 'resume' as any,
          id,
          draft: true, // Include draft content
        })
      } else {
        // For resume, if no ID provided, get the active one
        const result = await payload.find({
          collection: 'resume' as any,
          where: {
            isActive: {
              equals: true,
            },
          },
          draft: true, // Include draft content
        })
        doc = result.docs[0]
      }
    }

    if (!doc) {
      return Response.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    return Response.json(doc)
  } catch (error) {
    console.error('Live preview error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}