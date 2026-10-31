// src/app/(app)/projects/personal/page.tsx
import type { Metadata } from "next";
import { SectionHeading } from "@/components/layout/section/SectionHeading";
import { ProjectGrid } from "@/components/content/projects/ProjectGrid";
import { ProjectTabs } from "@/components/content/projects/ProjectTabs";
import { PROJECT_GROUPS } from "@/components/content/projects/groups";
import { getProjectsByType } from "@/lib/projects";

const group = PROJECT_GROUPS.personal;

export const metadata: Metadata = {
  title: group.heading,
  description: group.intro,
};

export default function PersonalProjectsPage() {
  return (
    <>
      <ProjectTabs />
      <SectionHeading title={group.heading} as='h1' />
      <p className='-mt-4 mb-10 max-w-2xl text-gray-700 dark:text-gray-200 lg:text-lg'>
        {group.intro}
      </p>
      <ProjectGrid projects={getProjectsByType("personal")} priorityCount={3} />
    </>
  );
}
