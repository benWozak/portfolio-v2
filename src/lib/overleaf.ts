type OverleafDocument = {
  id: string;
  name: string;
  pdfUrl?: string;
  content?: string;
};

/**
 * Fetches resume data from Overleaf API with Next.js caching
 */
export async function getOverleafResume(): Promise<OverleafDocument | null> {
  try {
    // Replace with your Overleaf document ID
    const documentId = process.env.OVERLEAF_DOCUMENT_ID;
    const apiKey = process.env.OVERLEAF_API_KEY;
    
    if (!documentId || !apiKey) {
      console.error('Missing Overleaf API credentials');
      return null;
    }

    // Using Next.js fetch with caching
    const response = await fetch(
      `https://www.overleaf.com/api/v1/documents/${documentId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        // Next.js fetch caching options 
        next: {
          // Revalidate data every hour
          revalidate: 3600,
          // Optional: Add tags for manual revalidation
          tags: ['resume']
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Get PDF URL from the response
    const pdfUrl = data.pdfUrl || data.download_url;
    
    return {
      id: documentId,
      name: data.name || 'Resume',
      pdfUrl
    };
  } catch (error) {
    console.error('Error fetching Overleaf document:', error);
    return null;
  }
}

/**
 * Downloads and processes PDF content with caching
 */
export async function getResumeContent(pdfUrl: string): Promise<string | null> {
  try {
    // Using Next.js fetch with caching
    const response = await fetch(pdfUrl, {
      next: {
        revalidate: 3600,
        tags: ['resume-pdf']
      }
    });

    if (!response.ok) {
      throw new Error(`PDF fetch error: ${response.status}`);
    }

    // Get the PDF as array buffer
    const pdfArrayBuffer = await response.arrayBuffer();
    const pdfBuffer = Buffer.from(pdfArrayBuffer);
    
    // You may need a PDF renderer/converter library here
    // Example using pdf-parse (you would need to install this)
    // const pdfParse = require('pdf-parse');
    // const data = await pdfParse(pdfBuffer);
    // return data.text;
    
    // For now, return base64 representation to use with PDF viewer
    return Buffer.from(pdfBuffer).toString('base64');
  } catch (error) {
    console.error('Error processing PDF:', error);
    return null;
  }
}

/**
 * Force revalidation of cached resume data (can be called from admin panel)
 */
export async function revalidateResumeCache() {
  try {
    // This would be called from an admin route that requires authentication
    const revalidateUrl = `/api/revalidate?tag=resume`;
    const response = await fetch(revalidateUrl, { method: 'POST' });
    return response.ok;
  } catch (error) {
    console.error('Failed to revalidate cache:', error);
    return false;
  }
}