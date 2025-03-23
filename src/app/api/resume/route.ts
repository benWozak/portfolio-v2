import { NextRequest, NextResponse } from 'next/server';
import { getOverleafResume, getResumeContent } from '@/lib/overleaf';

export async function GET(request: NextRequest) {
  try {
    const resume = await getOverleafResume();
    
    if (!resume || !resume.pdfUrl) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }
    
    // Get content if needed
    if (resume.pdfUrl) {
      const content = await getResumeContent(resume.pdfUrl);
      if (content) {
        resume.content = content;
      }
    }
    
    return NextResponse.json(resume);
  } catch (error) {
    console.error('Error in resume API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resume' },
      { status: 500 }
    );
  }
}