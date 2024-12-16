"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import { Project } from "@/types";

type Props = {
  project: Project;
};

function MediaContainer({ project }: Props) {
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
    <div
      className="xl:w-[600px] h-[400px] bg-gradient-to-br from-secondary-400 via-secondary-500 to-secondary-800 rounded-md"
      onClick={handleInteraction}
      onMouseEnter={() => !("ontouchstart" in window) && handleInteraction()}
      onMouseLeave={() => !("ontouchstart" in window) && handleInteraction()}
    >
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
          width={600}
          height={400}
          className="w-full h-full object-contain rounded-lg shadow-md"
        />
      )}
    </div>
  );
}

export default MediaContainer;
