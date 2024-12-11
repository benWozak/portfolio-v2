import { NextResponse } from 'next/server';
import projectsData from '@/data/projects.json';
import { Project } from '@/types';

export async function GET() {
  return NextResponse.json(projectsData);
}

export async function getProjectByName(name: string): Promise<Project | undefined> {
  return projectsData.find((project: Project) => project.name.toLowerCase() === name.toLowerCase());
}

