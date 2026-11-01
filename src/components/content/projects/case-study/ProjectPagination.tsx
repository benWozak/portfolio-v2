// src/components/content/projects/case-study/ProjectPagination.tsx
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";
import { PROJECT_GROUPS, type ProjectGroup } from "../groups";

interface Props {
  prev: Project | null;
  next: Project | null;
  /** The current project's group; the "All …" link goes to its page. */
  group: ProjectGroup;
}

function Cell({ project, direction }: { project: Project; direction: "Previous" | "Next" }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={cn(
        "focus-ring flex flex-col gap-1 rounded-lg bg-secondary-bg p-5 transition-colors hover:bg-secondary-200/60 dark:hover:bg-secondary-800/60",
        direction === "Next" && "items-end text-right"
      )}
    >
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {direction} project
      </span>
      <span className="text-lg font-semibold">{project.name}</span>
      <span className="sr-only">, {PROJECT_GROUPS[project.type].label}</span>
    </Link>
  );
}

export function ProjectPagination({ prev, next, group }: Props) {
  return (
    <nav aria-label="More projects" className="mt-20">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* An empty side keeps its column on md+ but takes no space on mobile. */}
        <div className={cn(!prev && "hidden md:block")}>{prev && <Cell project={prev} direction="Previous" />}</div>
        <div className={cn(!next && "hidden md:block")}>{next && <Cell project={next} direction="Next" />}</div>
      </div>
      <div className="mt-8 text-center">
        <Link href={group.href} className="focus-ring rounded-sm font-semibold text-primary-700 hover:underline dark:text-primary-400">
          {group.allLabel}
        </Link>
      </div>
    </nav>
  );
}
