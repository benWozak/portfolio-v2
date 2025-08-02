"use client";

import React, { useState, useEffect } from "react";
import Resume from "./Resume";
import { ResumeData } from "@/types/resume";
import { toast } from "react-hot-toast";

interface ResumeClientWrapperProps {
  initialResumeData: ResumeData;
  isDraftMode?: boolean;
}

export function ResumeClientWrapper({
  initialResumeData,
}: ResumeClientWrapperProps) {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [hideContactForPDF, setHideContactForPDF] = useState(true);

  // Update resume data when initial data changes (useful for live preview)
  useEffect(() => {
    setResumeData(initialResumeData);
  }, [initialResumeData]);

  const handleExportHTMLPDF = async () => {
    const element = document.getElementById("resume-container");
    if (!element) {
      toast.error("Resume container not found");
      return;
    }

    setIsGeneratingPDF(true);
    setHideContactForPDF(false); // Show real contact info for PDF
    toast.loading("Generating PDF...");

    try {
      // Add a temporary class to the document during PDF generation
      document.body.classList.add("generating-pdf");

      // Wait for React to re-render with new state
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get the HTML content with all styles
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              ${Array.from(document.styleSheets)
                .map((sheet) => {
                  try {
                    return Array.from(sheet.cssRules || [])
                      .map((rule) => rule.cssText)
                      .join("\n");
                  } catch {
                    return "";
                  }
                })
                .join("\n")}
            </style>
          </head>
          <body>
            ${element.outerHTML}
          </body>
        </html>
      `;

      const filename = `${resumeData.full_name.replace(/\s+/g, "_")}_Resume.pdf`;

      const response = await fetch("/api/generate-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html: htmlContent,
          filename: filename,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate PDF");
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.dismiss();
      toast.success("PDF generated successfully!");

      // Remove temporary class
      document.body.classList.remove("generating-pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.dismiss();
      toast.error(
        error instanceof Error ? error.message : "Failed to generate PDF"
      );

      // Remove temporary class
      document.body.classList.remove("generating-pdf");
    } finally {
      setIsGeneratingPDF(false);
      setHideContactForPDF(true); // Restore contact info hiding
    }
  };

  return (
    <Resume
      data={resumeData}
      onExportPDF={handleExportHTMLPDF}
      isGeneratingPDF={isGeneratingPDF}
      hideContactInfo={hideContactForPDF}
    />
  );
}
