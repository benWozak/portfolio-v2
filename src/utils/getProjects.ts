import { Project } from '@/types'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import configPromise from '../payload.config'
import { draftMode } from 'next/headers'
import { getBase64 } from './getBase46'

// Transform Payload project data to match Project interface
async function transformPayloadProject(payloadProject: any): Promise<Project> {
  // Transform tech stack from Payload array format to simple string arrays
  const transformTechStack = (techStack: any) => {
    if (!techStack) return { frontend: [], backend: [], other: [] }
    
    return {
      frontend: techStack.frontend?.map((item: any) => item.technology) || [],
      backend: techStack.backend?.map((item: any) => item.technology) || [],
      other: techStack.other?.map((item: any) => item.technology) || [],
    }
  }

  // Transform media from Payload nested object to expected format
  const transformMedia = async (media: any) => {
    const staticImage = media?.staticImage ? 
      (typeof media.staticImage === 'object' ? media.staticImage.url : media.staticImage) : ''
    const video = media?.video ? 
      (typeof media.video === 'object' ? media.video.url : media.video) : undefined
    
    // Generate blur placeholder for the static image
    let blurDataURL: string | undefined
    if (staticImage) {
      try {
        // Use the URL directly from Payload - it should already be the correct blob storage URL
        // Skip blur generation for relative API paths that aren't accessible in development
        if (staticImage.startsWith('/api/')) {
          blurDataURL = `data:image/svg+xml;base64,${Buffer.from(
            `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
              <rect width="600" height="400" fill="#e5e7eb"/>
            </svg>`
          ).toString('base64')}`
        } else {
          const base64 = await getBase64(staticImage)
          if (base64) {
            blurDataURL = base64
          } else {
            // Fallback to a simple SVG blur if generation fails
            blurDataURL = `data:image/svg+xml;base64,${Buffer.from(
              `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
                <rect width="600" height="400" fill="#e5e7eb"/>
              </svg>`
            ).toString('base64')}`
          }
        }
      } catch (error) {
        console.warn(`Failed to generate blur placeholder for ${staticImage}:`, error)
        // Fallback to a simple SVG blur if generation fails
        blurDataURL = `data:image/svg+xml;base64,${Buffer.from(
          `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
            <rect width="600" height="400" fill="#e5e7eb"/>
          </svg>`
        ).toString('base64')}`
      }
    }
    
    return { staticImage, video, blurDataURL }
  }

  return {
    id: payloadProject.id,
    name: payloadProject.name,
    type: payloadProject.type,
    status: payloadProject.status,
    description: payloadProject.description,
    overview: payloadProject.overview || '',
    challenge: payloadProject.challenge || '',
    solution: payloadProject.solution || '',
    techStack: transformTechStack(payloadProject.techStack),
    keyTakeaways: payloadProject.keyTakeaways || '',
    liveUrl: payloadProject.liveUrl || null,
    githubUrl: payloadProject.githubUrl || null,
    media: await transformMedia(payloadProject.media),
    order: payloadProject.order || 999,
    featured: payloadProject.featured || false,
  }
}

// Core server function to get projects from Payload
async function getProjectsFromPayload(isDraftMode?: boolean): Promise<Project[]> {
  const payload = await getPayload({ config: configPromise })
  
  // Only check draftMode if we're in a request context and isDraftMode is not explicitly set
  let shouldUseDraft = false
  if (isDraftMode !== undefined) {
    shouldUseDraft = isDraftMode
  } else {
    try {
      const { isEnabled } = await draftMode()
      shouldUseDraft = isEnabled
    } catch {
      // If draftMode() fails (e.g., outside request context), default to false
      shouldUseDraft = false
    }
  }
  
  const result = await payload.find({
    collection: 'projects' as any,
    draft: shouldUseDraft,
    depth: 2, // Include related media
    sort: 'order',
  })
  
  if (result.docs.length > 0) {
    // Use Promise.all to transform all projects in parallel (including blur generation)
    const projects = await Promise.all(
      result.docs.map(doc => transformPayloadProject(doc))
    )
    // Sort projects by order
    return projects.sort((a, b) => (Number(a.order)) - (Number(b.order)))
  }
  
  return []
}

// Cached version of getProjects for server components
export const getProjects = unstable_cache(
  async (): Promise<Project[]> => {
    try {
      return await getProjectsFromPayload()
    } catch (error) {
      console.error('Error fetching projects:', error)
      throw error // Don't fallback, let the error bubble up
    }
  },
  ['projects-data'], // cache key
  {
    tags: ['projects-data'], // cache tags for revalidation
    revalidate: 3600 // revalidate every hour as fallback
  }
)

// Get a single project by name
export async function getProjectByName(name: string, isDraftMode?: boolean): Promise<Project | undefined> {
  try {
    const payload = await getPayload({ config: configPromise })
    
    // Only check draftMode if we're in a request context and isDraftMode is not explicitly set
    let shouldUseDraft = false
    if (isDraftMode !== undefined) {
      shouldUseDraft = isDraftMode
    } else {
      try {
        const { isEnabled } = await draftMode()
        shouldUseDraft = isEnabled
      } catch {
        // If draftMode() fails (e.g., outside request context), default to false
        shouldUseDraft = false
      }
    }
    
    const result = await payload.find({
      collection: 'projects' as any,
      where: {
        name: {
          equals: name,
        },
      },
      draft: shouldUseDraft,
      depth: 2,
    })
    
    if (result.docs.length > 0) {
      return await transformPayloadProject(result.docs[0])
    }
  } catch (error) {
    console.error('Payload project fetch error:', error)
  }
  
  // Fallback to getting all projects and finding the match
  const projects = await getProjectsFromPayload(isDraftMode)
  return projects.find((project) => project.name.toLowerCase() === name.toLowerCase())
}

// Alternative fetch-based approach for API routes (updated URL)
export async function fetchProjectsWithCache(): Promise<Project[]> {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const response = await fetch(`${siteUrl}/api/projects`, {
      next: { 
        tags: ['projects-data'],
        revalidate: 3600
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching projects via fetch:', error)
    // Fallback to direct server function
    return await getProjects()
  }
}