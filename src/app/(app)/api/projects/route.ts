import { NextResponse } from 'next/server';
import { getProjects } from '@/utils/getProjects';

export async function GET() {
  try {
    const projects = await getProjects();
    const response = NextResponse.json(projects);
    
    // Add cache headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=3600');
    response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=3600');
    
    // CORS headers
    response.headers.set('Access-Control-Allow-Origin', 'https://www.benwozak.dev');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
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