import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { path, tag, collection } = body

    if (path) {
      revalidatePath(path)
    }
    
    if (tag) {
      revalidateTag(tag)
    }
    
    // For projects collection, revalidate both the API and page paths
    if (collection === 'projects') {
      revalidateTag('projects-data')
      revalidatePath('/projects')
      revalidatePath('/api/projects')
    }
    
    return NextResponse.json({ 
      revalidated: true, 
      now: Date.now(),
      path,
      tag,
      collection 
    })
  } catch (err) {
    console.error('Revalidation error:', err)
    return NextResponse.json(
      { message: 'Error revalidating', error: err instanceof Error ? err.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { message: 'Method not allowed. Use POST to revalidate cache.' },
    { status: 405 }
  )
}