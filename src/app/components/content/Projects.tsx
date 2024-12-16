"use client";

import React from "react";
import Section from "../layout/section";
import { getProjects } from "@/utils/getProjects";
import { CTAButton } from "../ui";
import { ProjectCard } from "../content/projects/ProjectCard";
import {
  AnimatedSection,
  itemVariants,
} from "../layout/section/AnimatedSection";
import { motion } from "framer-motion";
import { Project } from "@/types";

export function Projects() {
  const [projects, setProjects] = React.useState<Project[]>([]);

  React.useEffect(() => {
    async function fetchProjects() {
      const fetchedProjects = await getProjects();
      setProjects(fetchedProjects.slice(0, 2));
    }
    fetchProjects();
  }, []);

  return (
    <Section
      id="projects"
      title="Projects"
      className="flex items-center flex-1"
    >
      <AnimatedSection>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:px-0"
          variants={itemVariants}
        >
          {projects.map((project, index) => (
            <motion.div key={index} variants={itemVariants}>
              <ProjectCard index={index} project={project} />
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          className="mt-8 lg:mt-16 flex justify-center"
          variants={itemVariants}
        >
          <CTAButton href="/projects" className="w-72">
            See More
          </CTAButton>
        </motion.div>
      </AnimatedSection>
    </Section>
  );
}
