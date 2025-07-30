import { Project } from '@/types';
import rawProjectsData from '@/data/projects.json';
import { getPayload } from 'payload';
import configPromise from '../payload.config';
import { draftMode } from 'next/headers';

// Type assertion for imported JSON
const projectsData = rawProjectsData as any[];

// Transform old JSON format to new Project interface
function transformLegacyProject(legacyProject: any): Project {
  return {
    id: legacyProject.id,
    name: legacyProject.name,
    type: legacyProject.type,
    status: legacyProject.status,
    description: legacyProject.description,
    overview: legacyProject.overview || legacyProject.description,
    challenge: legacyProject.challenge || legacyProject.content?.concept || '',
    solution: legacyProject.solution || legacyProject.content?.solution || '',
    techStack: legacyProject.techStack || { frontend: [], backend: [], other: [] },
    keyTakeaways: legacyProject.keyTakeaways || '',
    liveUrl: legacyProject.liveUrl || null,
    githubUrl: legacyProject.githubUrl || null,
    media: {
      staticImage: legacyProject.staticImage || legacyProject.media?.staticImage || '',
      video: legacyProject.media?.video || legacyProject.media || undefined,
    },
    order: legacyProject.order || 999,
    featured: legacyProject.featured || false,
  };
}

// Transform Payload project data to match Project interface
function transformPayloadProject(payloadProject: any): Project {
  // Transform tech stack from Payload array format to simple string arrays
  const transformTechStack = (techStack: any) => {
    if (!techStack) return { frontend: [], backend: [], other: [] };
    
    return {
      frontend: techStack.frontend?.map((item: any) => item.technology) || [],
      backend: techStack.backend?.map((item: any) => item.technology) || [],
      other: techStack.other?.map((item: any) => item.technology) || [],
    };
  };

  // Transform media from Payload nested object to expected format
  const transformMedia = (media: any) => {
    const staticImage = media?.staticImage ? 
      (typeof media.staticImage === 'object' ? media.staticImage.url : media.staticImage) : '';
    const video = media?.video ? 
      (typeof media.video === 'object' ? media.video.url : media.video) : undefined;
    
    return { staticImage, video };
  };

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
    media: transformMedia(payloadProject.media),
    order: payloadProject.order || 999,
    featured: payloadProject.featured || false,
  };
}

export async function getProjectsServer(isDraftMode?: boolean): Promise<Project[]> {
  try {
    const payload = await getPayload({ config: configPromise });
    
    // Only check draftMode if we're in a request context and isDraftMode is not explicitly set
    let shouldUseDraft = false;
    if (isDraftMode !== undefined) {
      shouldUseDraft = isDraftMode;
    } else {
      try {
        const { isEnabled } = await draftMode();
        shouldUseDraft = isEnabled;
      } catch {
        // If draftMode() fails (e.g., outside request context), default to false
        shouldUseDraft = false;
      }
    }
    
    const result = await payload.find({
      collection: 'projects' as any,
      draft: shouldUseDraft,
      depth: 2, // Include related media
      sort: 'order,createdAt',
    });
    
    if (result.docs.length > 0) {
      return result.docs.map(transformPayloadProject);
    }
  } catch (error) {
    console.error('Payload projects fetch error:', error);
  }
  
  // Fallback to JSON data - transform legacy format
  return projectsData.map(transformLegacyProject);
}

export async function getProjectByNameServer(name: string, isDraftMode?: boolean): Promise<Project | undefined> {
  try {
    const payload = await getPayload({ config: configPromise });
    
    // Only check draftMode if we're in a request context and isDraftMode is not explicitly set
    let shouldUseDraft = false;
    if (isDraftMode !== undefined) {
      shouldUseDraft = isDraftMode;
    } else {
      try {
        const { isEnabled } = await draftMode();
        shouldUseDraft = isEnabled;
      } catch {
        // If draftMode() fails (e.g., outside request context), default to false
        shouldUseDraft = false;
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
    });
    
    if (result.docs.length > 0) {
      return transformPayloadProject(result.docs[0]);
    }
  } catch (error) {
    console.error('Payload project fetch error:', error);
  }
  
  // Fallback to getting all projects and finding the match
  const projects = await getProjectsServer(isDraftMode);
  return projects.find((project) => project.name.toLowerCase() === name.toLowerCase());
}