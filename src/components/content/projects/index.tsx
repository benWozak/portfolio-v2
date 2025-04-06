"use client";

import React from "react";
import Section from "../../layout/section";
import { getProjects } from "@/utils/getProjects";
import { CTAButton } from "../../ui";
import { ProjectCard } from "./ProjectCard";
import {
  AnimatedSection,
  itemVariants,
} from "../../layout/section/AnimatedSection";
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
        {/* <motion.div variants={itemVariants} className="mb-8">
          <p className="mb-4 text-sm md:text-base lg:text-xl text-gray-800 dark:text-gray-200">
            This collection features my side projects where I explore different
            web technologies and concepts outside of my day job.
          </p>
          <p className="text-sm md:text-base lg:text-xl text-gray-800 dark:text-gray-200">
            Through these prototypes, I satisfy my curiosity and expand my web
            development skills through hands-on experimentation with technical
            challenges and emerging tools.
          </p>
        </motion.div> */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:px-0 pt-4">
          {projects.map((project, index) => (
            <motion.div variants={itemVariants} key={index}>
              <ProjectCard index={index} project={project} />
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-8 lg:mt-12 flex justify-center"
          variants={itemVariants}
        >
          <CTAButton type="secondary" href="/projects" className="w-72">
            See More
          </CTAButton>
        </motion.div>
      </AnimatedSection>
    </Section>
  );
}
