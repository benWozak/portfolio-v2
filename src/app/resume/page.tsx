import { Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamically import the ResumeViewer component to avoid SSR issues with PDF.js
const ResumeViewer = dynamic(() => import("@/components/ResumeViewer"), {
  // ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-96">
      Loading resume viewer...
    </div>
  ),
});

export default function ResumePage() {
  return (
    <main className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">My Resume</h1>
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <ResumeViewer />
      </Suspense>
    </main>
  );
}
