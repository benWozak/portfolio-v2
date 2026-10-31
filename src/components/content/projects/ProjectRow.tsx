import { Badge } from "@/components/ui/Badge";
import { CTAButton } from "@/components/ui/CTAButton";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";
import { PROJECT_GROUPS } from "./groups";
import { ProjectImage } from "./ProjectImage";

interface Props {
  project: Project;
  /** Put the image on the right at `lg`. DOM order is unchanged so mobile always stacks image-then-text. */
  reverse?: boolean;
}

export function ProjectRow({ project, reverse = false }: Props) {
  const group = PROJECT_GROUPS[project.type];
  return (
    <article className="grid grid-cols-1 items-center gap-6 lg:grid-cols-5 lg:gap-10">
      <div className={cn("overflow-hidden rounded-lg bg-secondary-bg shadow-sm lg:col-span-3", reverse && "lg:order-last")}>
        <ProjectImage
          image={project.image}
          sizes="(max-width: 1023px) 100vw, 600px"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-col gap-4 lg:col-span-2">
        <p className={cn("text-xs font-semibold uppercase tracking-widest", group.accentText)}>{group.label}</p>
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-2xl font-bold lg:text-3xl">{project.name}</h3>
          <Badge status={project.status} />
        </div>
        <p className="text-gray-700 dark:text-gray-200 lg:text-lg">{project.description}</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row lg:flex-col">
          <CTAButton href={`/projects/${project.slug}`}>
            View project<span className="sr-only"> {project.name}</span>
          </CTAButton>
          <CTAButton type="secondary" href={group.href}>
            {group.allLabel}
          </CTAButton>
        </div>
      </div>
    </article>
  );
}
