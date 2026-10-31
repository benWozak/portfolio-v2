import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";
import { PROJECT_GROUPS } from "./groups";
import { ProjectImage } from "./ProjectImage";
import { TechChips, stackItems } from "./TechChips";

interface Props {
  project: Project;
  /** Above-the-fold cards load eagerly. */
  priority?: boolean;
}

export function ProjectCard({ project, priority = false }: Props) {
  const group = PROJECT_GROUPS[project.type];
  return (
    <article className="group relative flex h-full flex-col gap-3 rounded-lg has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-4 has-[:focus-visible]:ring-offset-background">
      <div className="aspect-[4/3] overflow-hidden rounded-lg bg-secondary-bg shadow-sm transition-[transform,box-shadow] duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-lg motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
        <ProjectImage
          image={project.image}
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
          priority={priority}
          className="h-full w-full object-cover"
        />
      </div>
      <p className={cn("text-xs font-semibold uppercase tracking-widest", group.accentText)}>
        {group.label}<span aria-hidden="true"> · </span>{project.status}
      </p>
      <h2 className="text-xl font-semibold leading-snug">
        <Link
          href={`/projects/${project.slug}`}
          className="focus:outline-none after:absolute after:inset-0 after:content-['']"
        >
          {project.name}
        </Link>
      </h2>
      <p className="line-clamp-2 text-gray-600 dark:text-gray-300">{project.description}</p>
      <TechChips items={stackItems(project.techStack)} max={3} className="mt-auto pt-1" />
    </article>
  );
}
