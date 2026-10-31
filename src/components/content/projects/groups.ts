// src/components/content/projects/groups.ts
// Everything the UI needs to know about a project type, in one place. Server-safe.
// Tailwind classes are complete literals so the content scanner keeps them.
import type { ProjectType } from "@/types";

export interface ProjectGroup {
  type: ProjectType;
  /** Eyebrow and tab text */
  label: string;
  /** Page h1 */
  heading: string;
  /** One-line intro under the h1 (owner copy) */
  intro: string;
  href: string;
  /** Secondary CTA text on the home row */
  allLabel: string;
  /** Eyebrow text colour */
  accentText: string;
  /** Active tab underline */
  accentBorder: string;
}

export const PROJECT_GROUPS: Record<ProjectType, ProjectGroup> = {
  professional: {
    type: "professional",
    label: "Professional",
    heading: "Professional work",
    intro: "Sites and apps I've built for clients and employers.",
    href: "/projects/professional",
    allLabel: "All professional work",
    accentText: "text-secondary-900 dark:text-secondary-400",
    accentBorder: "border-secondary-800 dark:border-secondary-400",
  },
  personal: {
    type: "personal",
    label: "Personal",
    heading: "Personal projects",
    intro: "Side projects and prototypes where I try things out.",
    href: "/projects/personal",
    allLabel: "All personal projects",
    accentText: "text-primary-700 dark:text-primary-400",
    accentBorder: "border-primary dark:border-primary-400",
  },
};

/** Display order: professional first. */
export const GROUP_ORDER: readonly ProjectType[] = ["professional", "personal"];
