"use client";

import React, { useState, useEffect } from "react";
import Resume from "@/components/resume/Resume";
import { ResumeData } from "@/types/resume";
import resumeData from "@/data/resume.json";
import { toast } from "react-hot-toast";

const loadResumeData = async (): Promise<ResumeData> => {
  try {
    const response = await fetch("/resume.json");

    if (response.ok) {
      return await response.json();
    } else {
      console.warn("Resume data not found, using placeholder data");
      return resumeData as unknown as ResumeData;
    }
  } catch (error) {
    console.error("Error loading resume data:", error);
    return resumeData as unknown as ResumeData;
  }
};

const ResumePage: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [html2pdfLib, setHtml2pdfLib] = useState<any>(null);

  useEffect(() => {
    // Dynamically import only on client side
    import("html2pdf.js").then((module) => {
      setHtml2pdfLib(() => module.default);
    });

    // Load resume data
    const fetchData = async () => {
      setIsLoading(true);
      const data = await loadResumeData();
      setResumeData(data);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleExportHTMLPDF = () => {
    if (!html2pdfLib) {
      toast.error("PDF generation library not loaded yet");
      return;
    }

    const element = document.getElementById("resume-container");
    if (!element) return;

    toast.loading("Generating PDF from HTML...");
    const filename = `${resumeData?.full_name.replace(
      /\s+/g,
      "_"
    )}_Resume_HTML.pdf`;

    const options = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdfLib()
      .set(options)
      .from(element)
      .save()
      .then(() => {
        toast.dismiss();
        toast.success("HTML PDF generated successfully!");
      })
      .catch((error: any) => {
        toast.dismiss();
        toast.error("Failed to generate HTML PDF");
        console.error("Error generating HTML PDF:", error);
      });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div
            className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading resume data...</p>
        </div>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500">Resume data not available.</p>
          <button
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Resume
        data={resumeData}
        onExportPDF={handleExportHTMLPDF}
        isGeneratingPDF={isGeneratingPDF}
      />
    </div>
  );
};

export default ResumePage;
