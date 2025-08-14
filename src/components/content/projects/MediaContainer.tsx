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
  const [showImage, setShowImage] = useState(false);

  const { elementRef, hasIntersected } = useIntersectionObserver({
    threshold: 0.2,
    rootMargin: "200px",
    triggerOnce: true,
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Show image immediately when in viewport or above fold
  useEffect(() => {
    if (isAboveFold || hasIntersected) {
      setShowImage(true);
    }
  }, [isAboveFold, hasIntersected]);

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
      className="h-fit inline-block rounded-md overflow-hidden relative"
      onClick={handleInteraction}
      onMouseEnter={() => !isMobile && handleInteraction()}
      onMouseLeave={() => !isMobile && handleInteraction()}
    >
      {/* Placeholder with blur effect while loading */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-secondary-400/20 via-secondary-500/20 to-secondary-800/20 backdrop-blur-xl transition-opacity duration-300 pointer-events-none ${
          showImage ? "opacity-0" : "opacity-100"
        }`}
        style={{ zIndex: 1 }}
      />

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
                priority={isAboveFold}
                loading={isAboveFold ? "eager" : "lazy"}
                onLoad={() => setShowImage(true)}
                placeholder="blur"
                blurDataURL={`data:image/svg+xml;base64,${Buffer.from(
                  `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
                    <rect width="600" height="400" fill="#e5e7eb"/>
                  </svg>`
                ).toString("base64")}`}
              />
              {showImage && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <div className="w-0 h-0 border-l-4 border-l-white border-y-2 border-y-transparent ml-1"></div>
                  </div>
                </div>
              )}
            </div>
          )}
          <Image
            src={project.media.staticImage}
            alt={project.name}
            width={600}
            height={400}
            className="max-w-full rounded-md md:hidden"
            priority={isAboveFold}
            loading={isAboveFold ? "eager" : "lazy"}
            onLoad={() => setShowImage(true)}
            placeholder={project.media.blurDataURL ? "blur" : "empty"}
            blurDataURL={project.media.blurDataURL}
          />
        </>
      ) : (
        <Image
          src={project.media.staticImage}
          alt={project.name}
          width={600}
          height={400}
          className="max-w-full rounded-md"
          priority={isAboveFold}
          loading={isAboveFold ? "eager" : "lazy"}
          onLoad={() => setShowImage(true)}
          placeholder={project.media.blurDataURL ? "blur" : "empty"}
          blurDataURL={project.media.blurDataURL}
        />
      )}
    </div>
  );
}

export default MediaContainer;
