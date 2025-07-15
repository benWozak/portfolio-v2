import { getPayload } from 'payload'
import configPromise from '../../../../payload.config'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(request: Request): Promise<Response> {
  const payload = await getPayload({
    config: configPromise,
  })

  const { searchParams } = new URL(request.url)
  const collection = searchParams.get('collection')
  const id = searchParams.get('id')
  const slug = searchParams.get('slug')

  console.log('Preview request:', { collection, id, slug })

  // Verify the request is legitimate
  if (!collection || (!id && !slug)) {
    console.log('Missing required parameters')
    return new Response('Missing required parameters', { status: 400 })
  }

  let doc
  try {
    if (collection === 'projects') {
      if (id) {
        doc = await payload.findByID({
          collection: 'projects' as any,
          id,
        })
      } else if (slug) {
        const result = await payload.find({
          collection: 'projects' as any,
          where: {
            name: {
              equals: slug,
            },
          },
        })
        doc = result.docs[0]
      }
    } else if (collection === 'resume') {
      if (id) {
        doc = await payload.findByID({
          collection: 'resume' as any,
          id,
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
        })
        doc = result.docs[0]
      }
    }
  } catch {
    return new Response('Document not found', { status: 404 })
  }

  if (!doc) {
    console.log('Document not found for collection:', collection, 'id:', id, 'slug:', slug)
    return new Response('Document not found', { status: 404 })
  }

  console.log('Document found:', doc.name || doc.version)

  // Enable Draft Mode
  const draft = await draftMode()
  draft.enable()

  // Determine redirect URL based on collection
  let redirectUrl = '/'
  
  if (collection === 'projects') {
    const projectSlug = doc.name?.toLowerCase().replace(/\s+/g, '-') || slug
    redirectUrl = `/projects/${projectSlug}`
  } else if (collection === 'resume') {
    redirectUrl = '/resume'
  }

  console.log('Redirecting to:', redirectUrl)

  // Redirect to the document's URL
  redirect(redirectUrl)
}