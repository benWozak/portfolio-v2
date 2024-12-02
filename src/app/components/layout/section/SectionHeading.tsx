import React from "react";

interface SectionHeadingProps {
  title: string;
}

export function SectionHeading({ title }: SectionHeadingProps) {
  return (
    <div className="relative mb-8 flex gap-4 items-center">
      <div className="w-6 lg:w-12 h-0.5 lg:h-1.5 rounded-full bg-primary"></div>
      <h2 className="inline-block text-2xl font-bold py-2 px-4 uppercase tracking-wider">
        {title}
      </h2>
    </div>
  );
}
