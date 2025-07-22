import { NextResponse } from 'next/server';
import projectsData from '@/data/projects.json';
import { getProjectsServer } from '@/utils/getProjectsServer';

export async function GET() {
  let response;
  
  try {
    const projects = await getProjectsServer();
    response = NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    response = NextResponse.json(projectsData);
  }
  
  response.headers.set('Access-Control-Allow-Origin', 'https://www.benwozak.dev');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://www.benwozak.dev',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}