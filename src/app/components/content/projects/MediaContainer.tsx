"use client";
import React, { useRef } from "react";
import Image from "next/image";
import { Project } from "@/types";

type Props = {
  project: Project;
};

function MediaContainer({ project }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <div
      className="xl:w-[600px] h-[400px] bg-gradient-to-br from-secondary-400 via-secondary-500 to-secondary-800 rounded-md"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {project.media.endsWith(".mp4") || project.media.endsWith(".mov") ? (
        <video
          ref={videoRef}
          src={project.media}
          className="w-full h-full object-fit"
          muted
          loop
          playsInline
        />
      ) : (
        <Image
          src={project.media}
          alt={project.name}
          width={600}
          height={400}
          className="w-full h-full object-contain rounded-lg shadow-md"
        />
      )}
    </div>
  );
}

export default MediaContainer;
