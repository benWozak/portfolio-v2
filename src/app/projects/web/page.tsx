"use client";

import { useEffect, useState } from "react";
import { getProjects } from "@/utils/getProjects";
import { ProjectCard } from "@/components/content/projects/ProjectCard";
import { SectionHeading } from "@/components/layout/section/SectionHeading";
import { motion, useAnimationControls } from "framer-motion";
import { Project } from "@/types";
import { calculateWaterfallDelay } from "@/utils/functions/animations";

export default function WebProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isReady, setIsReady] = useState(false);
  const controls = useAnimationControls();

  useEffect(() => {
    async function loadProjects() {
      const allProjects = await getProjects();
      const webProjects = allProjects.filter(
        (project) => project.type === "web"
      );
      setProjects(webProjects);

      setTimeout(() => {
        setIsReady(true);
      }, 100);
    }
    loadProjects();
  }, []);

  useEffect(() => {
    if (isReady) {
      controls.start("visible");
    }
  }, [isReady, controls]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[25rem]">
      {projects.map((project, index) => (
        <motion.div
          key={project.id}
          custom={index}
          initial="hidden"
          animate={controls}
          variants={{
            hidden: {
              opacity: 0,
              y: 40,
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
          <ProjectCard index={index} project={project} />
        </motion.div>
      ))}
    </div>
  );
}
