import React from "react";
import { getActiveResume } from "@/utils/getResume";
import { LivePreviewToolbar } from "@/components/layout";
import { draftMode } from "next/headers";
import { AnimatedSection } from "@/components/layout/section/AnimatedSection";
import { ResumeClientWrapper } from "@/components/resume/ResumeClientWrapper";

export default async function ResumePage() {
  const { isEnabled } = await draftMode();
  const resumeData = await getActiveResume();

  if (!resumeData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500">Resume data not available.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <LivePreviewToolbar 
        isDraftMode={isEnabled} 
        collection="resume" 
      />
      <AnimatedSection className={`container mx-auto px-4 py-8 ${isEnabled ? 'pt-20' : ''}`}>
        <ResumeClientWrapper 
          initialResumeData={resumeData}
          isDraftMode={isEnabled}
        />
      </AnimatedSection>
    </>
  );
};
