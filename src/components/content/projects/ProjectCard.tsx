import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Project } from "@/types";
import { Badge } from "../../ui/Badge";

type Props = {
  project: Project;
  isAboveFold?: boolean;
};

export function ProjectCard({ project, isAboveFold = false }: Props) {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Use project's blur data if available, otherwise use fallback
  const shimmerBlurDataUrl =
    project.media.blurDataURL ||
    `data:image/svg+xml;base64,${Buffer.from(
      `<svg width="400" height="225" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#e5e7eb" offset="20%" />
          <stop stop-color="#f3f4f6" offset="50%" />
          <stop stop-color="#e5e7eb" offset="70%" />
        </linearGradient>
      </defs>
      <rect width="400" height="225" fill="#e5e7eb"/>
      <rect id="r" width="400" height="225" fill="url(#g)" />
    </svg>`
    ).toString("base64")}`;

  return (
    <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden hover:shadow-md hover:shadow-slate-300 hover:dark:shadow-slate-500 transition-all duration-300">
      <Link
        href={`/projects/${project.name.toLowerCase().replace(/\s+/g, "-")}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-56 bg-gradient-to-br from-secondary-300 via-secondary-500 to-secondary-700">
          {/* Ultra-light loading state - just a subtle animation */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
          )}

          <Image
            src={project.media.staticImage}
            alt={project.name}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={isAboveFold}
            loading={isAboveFold ? "eager" : "lazy"}
            onLoad={() => setImageLoaded(true)}
            placeholder="blur"
            blurDataURL={shimmerBlurDataUrl}
            className={`transition-opacity duration-200 ${
              imageLoaded ? "opacity-100" : "opacity-90"
            }`}
          />

          <div
            className={`absolute top-2 right-2 transition-opacity duration-200 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          >
            <Badge status={project.status} />
          </div>
        </div>
        <div className="p-4">
          <h2 className="text-xl font-semibold">{project.name}</h2>
          <Badge status={project.type} />
          <p className="text-gray-600 dark:text-gray-200 mt-4">
            {project.description}
          </p>
        </div>
      </Link>
    </div>
  );
}
