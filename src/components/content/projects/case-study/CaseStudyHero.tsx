// src/components/content/projects/case-study/CaseStudyHero.tsx
// FINAL (design option A, 2026-10-31).
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";
import { PROJECT_GROUPS } from "../groups";
import { ProjectImage } from "../ProjectImage";

export function CaseStudyHero({ project }: { project: Project }) {
  const group = PROJECT_GROUPS[project.type];
  return (
    <header className="mb-12">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Badge status={project.status} />
        <Link
          href={group.href}
          className={cn("focus-ring rounded-sm text-xs font-semibold uppercase tracking-widest", group.accentText)}
        >
          {group.label}
        </Link>
      </div>
      <h1 className="text-3xl font-bold tracking-tight lg:text-5xl">{project.name}</h1>
      <p className="mt-4 max-w-3xl text-lg text-gray-600 dark:text-gray-300 lg:text-xl">{project.description}</p>
      <ProjectImage
        image={project.image}
        sizes="(max-width: 1023px) 100vw, (max-width: 1535px) calc(100vw - 2rem), 1504px"
        priority
        className="mt-8 w-full rounded-xl shadow-md"
      />
    </header>
  );
}
