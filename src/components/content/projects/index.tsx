"use client";

import React from "react";
import Section from "../../layout/section";
// Removed direct import - using fetch to API route instead
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
      try {
        const response = await fetch('/api/projects');
        if (response.ok) {
          const fetchedProjects = await response.json();
          setProjects(fetchedProjects.slice(0, 2));
        } else {
          console.error('Failed to fetch projects');
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    }
    fetchProjects();
  }, []);

  return (
    <Section
      id="projects"
      title="Recent Work"
      className="flex items-center flex-1"
    >
      <AnimatedSection>
        {/* <motion.div variants={itemVariants} className="mb-8">
          <p className="mb-4 md:text-lg lg:text-xl text-gray-800 dark:text-gray-200">
            This collection features my side projects where I explore different
            web technologies and concepts outside of my day job.
          </p>
          <p className="md:text-lg lg:text-xl text-gray-800 dark:text-gray-200">
            Through these prototypes, I satisfy my curiosity and expand my web
            development skills through hands-on experimentation with technical
            challenges and emerging tools.
          </p>
        </motion.div> */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:px-0 pt-4">
          {projects.map((project, index) => (
            <motion.div variants={itemVariants} key={index}>
              <ProjectCard project={project} isAboveFold={true} />
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
