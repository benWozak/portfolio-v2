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
  initialResumeData
}: ResumeClientWrapperProps) {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [html2pdfLib, setHtml2pdfLib] = useState<any>(null);

  useEffect(() => {
    // Dynamically import only on client side
    import("html2pdf.js").then((module) => {
      setHtml2pdfLib(() => module.default);
    });
  }, []);

  // Update resume data when initial data changes (useful for live preview)
  useEffect(() => {
    setResumeData(initialResumeData);
  }, [initialResumeData]);

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

    // Add a temporary class to the document during PDF generation
    document.body.classList.add("generating-pdf");

    // Redact sensitive information
    phoneElements.forEach((el) => {
      el.textContent = resumeData.phone;
    });
    emailElements.forEach((el) => {
      el.textContent = resumeData.email;
    });

    toast.loading("Generating PDF from HTML...");
    const filename = `${resumeData.full_name.replace(/\s+/g, "_")}_Resume.pdf`;

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
        precision: 16,
      },
      pagebreak: { mode: "avoid-all", before: "#page2el" },
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

        // Remove temporary class
        document.body.classList.remove("generating-pdf");

        // Remove temporary styles
        const tempStyles = document.getElementById("pdf-export-styles");
        if (tempStyles) tempStyles.remove();

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

        // Remove temporary class
        document.body.classList.remove("generating-pdf");

        // Remove temporary styles
        const tempStyles = document.getElementById("pdf-export-styles");
        if (tempStyles) tempStyles.remove();

        setIsGeneratingPDF(false);
      });
  };

  return (
    <Resume
      data={resumeData}
      onExportPDF={handleExportHTMLPDF}
      isGeneratingPDF={isGeneratingPDF}
      hideContactInfo={true}
    />
  );
}