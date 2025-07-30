import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Project } from "@/types";
import { Badge } from "../../ui/Badge";
type Props = {
  project: Project;
  isAboveFold?: boolean;
};

export function ProjectCard({ project, isAboveFold = false }: Props) {
  return (
    <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden hover:shadow-md hover:shadow-slate-300 hover:dark:shadow-slate-500 transition-all duration-300">
      <Link
        href={`/projects/${project.name.toLowerCase().replace(/\s+/g, "-")}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-56 bg-gradient-to-br from-secondary-300 via-secondary-500 to-secondary-700">
          <Image
            src={project.media.staticImage}
            alt={project.name}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={isAboveFold}
          />
          <div className="absolute top-2 right-2">
            <Badge status={project.status} />
          </div>
        </div>
        <div className="p-4">
          <h2 className="text-xl font-semibold ">{project.name}</h2>
          <Badge status={project.type} />
          <p className="text-gray-600 dark:text-gray-200 mt-4">
            {project.description}
          </p>
        </div>
      </Link>
    </div>
  );
}
