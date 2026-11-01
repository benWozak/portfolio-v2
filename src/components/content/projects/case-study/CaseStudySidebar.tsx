// src/components/content/projects/case-study/CaseStudySidebar.tsx
// FINAL (design option B "open rows"). The page places this in the third grid
// column on lg+, sticky; below lg it sits between the hero and the body.
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";
import { PROJECT_GROUPS } from "../groups";
import { ProjectLinks } from "../ProjectLinks";
import { TechChips, stackItems } from "../TechChips";

const LABEL = "text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400";
const ROW = "flex items-center justify-between gap-3 py-3 first:pt-0";

export function CaseStudySidebar({ project, className }: { project: Project; className?: string }) {
  const group = PROJECT_GROUPS[project.type];
  return (
    <aside aria-labelledby="project-details" className={className}>
      <h2 id="project-details" className="sr-only">
        Project details
      </h2>
      <dl className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className={ROW}>
          <dt className={LABEL}>Status</dt>
          <dd>
            <Badge status={project.status} />
          </dd>
        </div>
        <div className={ROW}>
          <dt className={LABEL}>Type</dt>
          <dd>
            <Link href={group.href} className={cn("focus-ring rounded-sm font-semibold hover:underline", group.accentText)}>
              {group.label}
            </Link>
          </dd>
        </div>
        <div className="py-3">
          <dt className={cn(LABEL, "mb-2.5")}>Stack</dt>
          <dd>
            <TechChips items={stackItems(project.techStack)} />
          </dd>
        </div>
      </dl>
      <ProjectLinks
        liveUrl={project.liveUrl}
        githubUrl={project.githubUrl}
        showRightsNote
        className="border-t border-gray-200 pt-4 dark:border-gray-700"
      />
    </aside>
  );
}
