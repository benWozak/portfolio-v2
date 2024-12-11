import { NextResponse } from 'next/server';
import projectsData from '@/data/projects.json';

export async function GET() {
    return NextResponse.json(projectsData);
}