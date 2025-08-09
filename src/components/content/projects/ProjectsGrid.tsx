"use client";

import { useEffect, useState } from "react";
import { ProjectCard } from "./ProjectCard";
import { motion, useAnimationControls } from "framer-motion";
import { Project } from "@/types";
import { calculateWaterfallDelay } from "@/utils/functions/animations";

interface ProjectsGridProps {
  projects: Project[];
}

export function ProjectsGrid({ projects }: ProjectsGridProps) {
  const [isReady, setIsReady] = useState(false);
  const controls = useAnimationControls();

  useEffect(() => {
    setTimeout(() => {
      setIsReady(true);
    }, 100);
  }, []);

  useEffect(() => {
    if (isReady) {
      controls.start("visible");
    }
  }, [isReady, controls]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[25rem]">
      {projects.map((project, index) => (
        <motion.div
          key={project.id || index}
          custom={index}
          initial="hidden"
          animate={controls}
          variants={{
            hidden: {
              opacity: 0,
              y: 20,
            },
            visible: (i) => ({
              opacity: 1,
              y: 0,
              transition: {
                delay: calculateWaterfallDelay(i),
                duration: 1.1,
                ease: [0.16, 0.1, 0.3, 1],
              },
            }),
          }}
        >
          <ProjectCard project={project} isAboveFold={index < 3} />
        </motion.div>
      ))}
    </div>
  );
}