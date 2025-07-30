"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Project } from "@/types";
import { useIntersectionObserver } from "@/utils/hooks";
import { VideoLoader } from "@/components/ui";

type Props = {
  project: Project;
  isAboveFold?: boolean;
};

function MediaContainer({ project, isAboveFold = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  
  const { elementRef, hasIntersected } = useIntersectionObserver({
    threshold: 0.2,
    rootMargin: '200px',
    triggerOnce: true
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleVideoLoad = () => {
    setIsVideoLoading(false);
  };

  const handleVideoError = () => {
    setVideoError(true);
    setIsVideoLoading(false);
  };

  const handleInteraction = () => {
    if (isMobile || videoError) return;
    if (videoRef.current) {
      if (!isPlaying) {
        videoRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((error) => {
            console.log("Playback failed:", error);
            setVideoError(true);
          });
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const shouldLoadVideo = isAboveFold || hasIntersected;

  return (
    <div
      ref={elementRef}
      className="h-fit inline-block bg-gradient-to-br from-secondary-400 via-secondary-500 to-secondary-800 rounded-md overflow-hidden relative"
      onClick={handleInteraction}
      onMouseEnter={() => !isMobile && handleInteraction()}
      onMouseLeave={() => !isMobile && handleInteraction()}
    >
      {!!project?.media?.video &&
      (project.media.video.endsWith(".mp4") ||
        project.media.video.endsWith(".mov")) && 
      !isMobile ? (
        <>
          {shouldLoadVideo ? (
            <>
              {isVideoLoading && !videoError && (
                <div className="absolute inset-0 z-10">
                  <VideoLoader className="w-full h-full rounded-md" />
                </div>
              )}
              <video
                ref={videoRef}
                src={project.media.video}
                className="max-w-full rounded-md hidden md:block"
                muted
                loop
                playsInline
                controls={false}
                preload={isAboveFold ? "auto" : "metadata"}
                poster={project.media.staticImage}
                onLoadedData={handleVideoLoad}
                onError={handleVideoError}
              />
            </>
          ) : (
            <div className="relative w-full h-64">
              <Image
                src={project.media.staticImage}
                alt={`${project.name} preview`}
                fill
                style={{ objectFit: "cover" }}
                className="rounded-md"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-l-4 border-l-white border-y-2 border-y-transparent ml-1"></div>
                </div>
              </div>
            </div>
          )}
          <Image
            src={project.media.staticImage}
            alt={project.name}
            width={600}
            height={400}
            className="max-w-full rounded-md md:hidden"
          />
        </>
      ) : (
        <Image
          src={project.media.staticImage}
          alt={project.name}
          width={600}
          height={400}
          className="max-w-full rounded-md"
        />
      )}
    </div>
  );
}

export default MediaContainer;
