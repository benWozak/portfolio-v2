"use client";

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
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

    setIsGeneratingPDF(true);

    const phoneElements = element.querySelectorAll(".phone-display");
    const emailElements = element.querySelectorAll(".email-display");

    // Store original values
    const originalValues = {
      phones: Array.from(phoneElements).map((el) => el.textContent),
      emails: Array.from(emailElements).map((el) => el.textContent),
    };

    // Replace with actual values for PDF
    phoneElements.forEach((el) => {
      el.textContent = resumeData!.phone;
    });
    emailElements.forEach((el) => {
      el.textContent = resumeData!.email;
    });

    toast.loading("Generating PDF from HTML...");
    const filename = `${resumeData?.full_name.replace(/\s+/g, "_")}_Resume.pdf`;

    const options = {
      margin: [0.3, 0.5, 0.3, 0.5], // [top, right, bottom, left]
      filename: filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        scrollY: 0,
        windowWidth: document.documentElement.offsetWidth,
      },
      jsPDF: {
        unit: "in",
        format: "letter",
        orientation: "portrait",
        compress: true,
        precision: 16, // Higher precision for positioning
      },
      pagebreak: { mode: ["avoid-all"] }, // To prevent text from being cut between pages
    };

    html2pdfLib()
      .set(options)
      .from(element) // Use the original element, but with un-redacted info
      .save()
      .then(() => {
        toast.dismiss();
        toast.success("PDF generated successfully!");

        // Restore original values
        phoneElements.forEach((el, i) => {
          el.textContent = originalValues.phones[i];
        });
        emailElements.forEach((el, i) => {
          el.textContent = originalValues.emails[i];
        });

        setIsGeneratingPDF(false);
      })
      .catch((error: any) => {
        toast.dismiss();
        toast.error("Failed to generate PDF");
        console.error("Error generating PDF:", error);

        // Restore original values on error too
        phoneElements.forEach((el, i) => {
          el.textContent = originalValues.phones[i];
        });
        emailElements.forEach((el, i) => {
          el.textContent = originalValues.emails[i];
        });

        setIsGeneratingPDF(false);
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
            <span className="visually-hidden"></span>
          </div>
          <p className="mt-2">Loading...</p>
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
        hideContactInfo={true}
      />
    </div>
  );
};

export default ResumePage;
