"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Project } from "@/types";
import { motion } from "framer-motion";
import { Badge } from "../../ui/Badge";

type Props = {
  index: number;
  project: Project;
};

export function ProjectCard({ index, project }: Props) {
  return (
    <motion.div
      key={project.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-secondary-bg rounded-lg shadow-md overflow-hidden"
    >
      <Link
        href={`/projects/${project.name.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <div className="relative h-48">
          {project.media.endsWith(".mp4") || project.media.endsWith(".mov") ? (
            <video
              src={project.media}
              className="w-full h-full object-fit"
              muted
              loop
              autoPlay
              playsInline
            />
          ) : (
            <Image
              src={project.media}
              alt={project.name}
              layout="fill"
              objectFit="cover"
            />
          )}
          <div className="absolute top-2 right-2">
            <Badge status={project.status} />
          </div>
        </div>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
          <p className="text-gray-600">{project.description}</p>
        </div>
      </Link>
    </motion.div>
  );
}
