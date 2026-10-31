import type { Project } from "@/types";
import { ProjectCard } from "./ProjectCard";

interface Props {
  projects: Project[];
  /** How many leading cards load their image eagerly. */
  priorityCount?: number;
}

export function ProjectGrid({ projects, priorityCount = 0 }: Props) {
  if (projects.length === 0) {
    return <p className="py-12 text-center text-gray-600 dark:text-gray-300">Nothing here yet.</p>;
  }
  return (
    <ul role="list" className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, i) => (
        <li key={project.slug}>
          <ProjectCard project={project} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
