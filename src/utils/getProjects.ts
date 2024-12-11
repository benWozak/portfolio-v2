import { Project } from '@/types';

export async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`);
  if (!res.ok) {
    throw new Error('Failed to fetch projects');
  }
  return res.json();
}

export async function getProjectByName(name: string): Promise<Project | undefined> {
  const projects = await getProjects();
  return projects.find((project) => project.name.toLowerCase() === name.toLowerCase());
}

