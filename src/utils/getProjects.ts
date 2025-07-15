import { Project } from '@/types';
import rawProjectsData from '@/data/projects.json';

// Type assertion for imported JSON
const projectsData = rawProjectsData as Project[];

export async function getProjects(): Promise<Project[]> {
  if (typeof window === 'undefined') {
    return projectsData;
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/projects`);
    if (!res.ok) {
      throw new Error('Failed to fetch projects');
    }
    const data = await res.json();
    return data as Project[];
  } catch (error) {
    console.error('Projects fetch error:', error);
    return projectsData;
  }
}

export async function getProjectByName(name: string): Promise<Project | undefined> {
  const projects = await getProjects();
  return projects.find((project) => project.name.toLowerCase() === name.toLowerCase());
}