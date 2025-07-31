import { Project } from '@/types';
import rawProjectsData from '@/data/projects.json';

// Type assertion for imported JSON - note: JSON data may be in old format
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
  };
}

export async function getProjects(): Promise<Project[]> {
  if (typeof window === 'undefined') {
    return projectsData.map(transformLegacyProject);
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/projects-public`);
    if (!res.ok) {
      throw new Error('Failed to fetch projects');
    }
    const data = await res.json();
    return data as Project[];
  } catch (error) {
    console.error('Projects fetch error:', error);
    return projectsData.map(transformLegacyProject);
  }
}

export async function getProjectByName(name: string): Promise<Project | undefined> {
  const projects = await getProjects();
  return projects.find((project) => project.name.toLowerCase() === name.toLowerCase());
}