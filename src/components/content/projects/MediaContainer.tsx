"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Project } from "@/types";

type Props = {
  project: Project;
};

function MediaContainer({ project }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleInteraction = () => {
    if (isMobile) return;
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
      onMouseEnter={() => !isMobile && handleInteraction()}
      onMouseLeave={() => !isMobile && handleInteraction()}
    >
      {project.media.endsWith(".mp4") || project.media.endsWith(".mov") ? (
        <>
          <video
            ref={videoRef}
            src={project.media}
            className="w-full h-full object-fit hidden md:block"
            muted
            loop
            playsInline
            controls={false}
            preload="metadata"
          />
          <Image
            src={project.staticImage}
            alt={project.name}
            width={600}
            height={400}
            className="w-full h-full object-contain rounded-lg shadow-md md:hidden"
          />
        </>
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
