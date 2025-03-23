"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { useCallback } from "react";

// Set the worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function ResumeViewer() {
  const [resumeData, setResumeData] = useState<{
    pdfUrl?: string;
    content?: string;
  } | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResume() {
      try {
        setLoading(true);
        const response = await fetch("/api/resume");

        if (!response.ok) {
          throw new Error("Failed to fetch resume");
        }

        const data = await response.json();
        setResumeData(data);
      } catch (err) {
        setError("Error loading resume");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchResume();
  }, []);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
    },
    []
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        Loading resume...
      </div>
    );
  }

  if (error || !resumeData) {
    return (
      <div className="text-red-500">
        Unable to load resume. Please try again later.
      </div>
    );
  }

  // If we have base64 PDF content
  const pdfData = resumeData.content
    ? `data:application/pdf;base64,${resumeData.content}`
    : resumeData.pdfUrl;

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4">
        <button
          onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
          disabled={pageNumber <= 1}
          className="px-4 py-2 mr-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {pageNumber} of {numPages || "?"}
        </span>
        <button
          onClick={() =>
            setPageNumber((prev) =>
              numPages ? Math.min(prev + 1, numPages) : prev
            )
          }
          disabled={numPages !== null && pageNumber >= numPages}
          className="px-4 py-2 ml-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <div className="border shadow-lg">
        <Document
          file={pdfData}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div>Loading PDF...</div>}
          error={<div>Failed to load PDF</div>}
        >
          <Page
            pageNumber={pageNumber}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            scale={1.2}
          />
        </Document>
      </div>

      <div className="mt-4">
        <a
          href={resumeData.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Download Resume
        </a>
      </div>
    </div>
  );
}
