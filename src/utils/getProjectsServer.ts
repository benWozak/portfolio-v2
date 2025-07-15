import { Project } from '@/types';
import rawProjectsData from '@/data/projects.json';
import { getPayload } from 'payload';
import configPromise from '../payload.config';
import { draftMode } from 'next/headers';

// Type assertion for imported JSON
const projectsData = rawProjectsData as Project[];

// Transform Payload project data to match existing Project interface
function transformPayloadProject(payloadProject: any): Project {
  return {
    id: payloadProject.id,
    name: payloadProject.name,
    type: payloadProject.type,
    status: payloadProject.status,
    description: payloadProject.description,
    media: typeof payloadProject.media === 'object' ? payloadProject.media?.url : payloadProject.media,
    staticImage: typeof payloadProject.staticImage === 'object' ? payloadProject.staticImage?.url : payloadProject.staticImage,
    liveUrl: payloadProject.liveUrl,
    githubUrl: payloadProject.githubUrl,
    content: payloadProject.content,
  };
}

export async function getProjectsServer(isDraftMode?: boolean): Promise<Project[]> {
  try {
    const payload = await getPayload({ config: configPromise });
    
    const { isEnabled } = await draftMode();
    const shouldUseDraft = isDraftMode ?? isEnabled;
    
    const result = await payload.find({
      collection: 'projects' as any,
      draft: shouldUseDraft,
      depth: 2, // Include related media
    });
    
    if (result.docs.length > 0) {
      return result.docs.map(transformPayloadProject);
    }
  } catch (error) {
    console.error('Payload projects fetch error:', error);
  }
  
  // Fallback to JSON data
  return projectsData;
}

export async function getProjectByNameServer(name: string, isDraftMode?: boolean): Promise<Project | undefined> {
  try {
    const payload = await getPayload({ config: configPromise });
    
    const { isEnabled } = await draftMode();
    const shouldUseDraft = isDraftMode ?? isEnabled;
    
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