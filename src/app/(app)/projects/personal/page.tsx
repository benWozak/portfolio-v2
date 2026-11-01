// src/app/(app)/projects/personal/page.tsx
import type { Metadata } from "next";
import { SectionHeading } from "@/components/layout/section/SectionHeading";
import { ProjectGrid } from "@/components/content/projects/ProjectGrid";
import { ProjectTabs } from "@/components/content/projects/ProjectTabs";
import { PROJECT_GROUPS } from "@/components/content/projects/groups";
import { getProjectsByType } from "@/lib/projects";
import { SITE_IMAGE, SITE_LOCALE, SITE_NAME } from "@/lib/site";

const group = PROJECT_GROUPS.personal;

export const metadata: Metadata = {
  title: group.heading,
  description: group.intro,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    url: group.href,
    title: group.heading,
    description: group.intro,
    images: [SITE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: group.heading,
    description: group.intro,
    images: [SITE_IMAGE],
  },
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
