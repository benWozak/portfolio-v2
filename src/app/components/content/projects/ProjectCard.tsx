"use client";

import React, { useRef, useState } from "react";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleInteraction = () => {
    if (videoRef.current) {
      if (!isPlaying) {
        videoRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((error) => console.log("Playback failed:", error));
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <motion.div
      key={project.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-secondary-bg rounded-lg shadow-md overflow-hidden"
      onClick={handleInteraction}
      onMouseEnter={() => !("ontouchstart" in window) && handleInteraction()}
      onMouseLeave={() => !("ontouchstart" in window) && handleInteraction()}
    >
      <Link
        href={`/projects/${project.name.toLowerCase().replace(/\s+/g, "-")}`}
        onClick={(e) => e.stopPropagation()} // Prevent link navigation when clicking to play/pause
      >
        <div className="relative h-56 bg-gradient-to-br from-secondary-300 via-secondary-500 to-secondary-700">
          {project.media.endsWith(".mp4") || project.media.endsWith(".mov") ? (
            <video
              ref={videoRef}
              src={project.media}
              className="w-full h-full object-fit"
              muted
              loop
              playsInline
              controls={false}
              preload="metadata"
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
          <h2 className="text-xl font-semibold ">{project.name}</h2>
          <Badge status={project.type} />
          <p className="text-gray-600 dark:text-gray-300 mt-4">
            {project.description}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
