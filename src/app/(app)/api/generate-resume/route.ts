import { NextRequest, NextResponse } from 'next/server';
import { YakPDFRequest, GenerateResumeRequest } from '@/types/yakpdf';
import crypto from 'crypto';

// Cache for storing PDF responses (in production, use Redis or similar)
const pdfCache = new Map<string, { pdf: ArrayBuffer; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

function generateCacheKey(html: string): string {
  return crypto.createHash('md5').update(html).digest('hex');
}

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION;
}

async function callYakPDFAPI(html: string): Promise<ArrayBuffer> {
  const apiKey = process.env.YAKPDF_API_KEY;
  const apiHost = process.env.YAKPDF_HOST;

  if (!apiKey || !apiHost) {
    throw new Error('YakPDF API credentials not configured');
  }

  const requestBody: YakPDFRequest = {
    source: {
      html
    },
    pdf: {
      format: 'Letter',
      scale: 1,
      printBackground: true,
      margin: {
        top: '0.3in',
        right: '0.5in',
        bottom: '0.3in',
        left: '0.5in'
      }
    },
    wait: {
      for: 'navigation',
      waitUntil: 'load',
      timeout: 5000
    }
  };

  const response = await fetch('https://yakpdf.p.rapidapi.com/pdf', {
    method: 'POST',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': apiHost,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody),
    // Enable Next.js caching with 1 hour revalidation
    next: { revalidate: 3600 }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`YakPDF API error: ${response.status} - ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return arrayBuffer;
}

export async function POST(req: NextRequest) {
  try {
    const { html, filename }: GenerateResumeRequest = await req.json();

    if (!html) {
      return NextResponse.json(
        { success: false, error: 'HTML content is required' },
        { status: 400 }
      );
    }

    // Generate cache key from HTML content
    const cacheKey = generateCacheKey(html);

    // Check cache first
    const cached = pdfCache.get(cacheKey);
    if (cached && isCacheValid(cached.timestamp)) {
      console.log('Serving PDF from cache');
      return new Response(cached.pdf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename || 'resume.pdf'}"`,
          'Cache-Control': 'public, max-age=3600' // 1 hour browser cache
        }
      });
    }

    // Generate new PDF
    console.log('Generating new PDF with YakPDF');
    const pdfBuffer = await callYakPDFAPI(html);

    // Cache the result
    pdfCache.set(cacheKey, {
      pdf: pdfBuffer,
      timestamp: Date.now()
    });

    // Clean up old cache entries (basic cleanup)
    for (const [key, value] of pdfCache.entries()) {
      if (!isCacheValid(value.timestamp)) {
        pdfCache.delete(key);
      }
    }

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename || 'resume.pdf'}"`,
        'Cache-Control': 'public, max-age=3600' // 1 hour browser cache
      }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate PDF' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to generate PDF.' },
    { status: 405 }
  );
}