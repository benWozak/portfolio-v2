"use client";

import { motion } from "framer-motion";
import Section from "../../layout/section";
import { AnimatedSection, itemVariants } from "../../layout/section/AnimatedSection";
import type { Project } from "@/types";
import { ProjectRow } from "./ProjectRow";

interface ProjectsProps {
  professional: Project;
  personal: Project;
}

export function Projects({ professional, personal }: ProjectsProps) {
  return (
    <Section id="projects" title="Recent Work" className="max-w-5xl px-4 xl:px-0">
      <div className="flex flex-col gap-16 lg:gap-24">
        <AnimatedSection>
          <motion.div variants={itemVariants}>
            <ProjectRow project={professional} />
          </motion.div>
        </AnimatedSection>
        <AnimatedSection>
          <motion.div variants={itemVariants}>
            <ProjectRow project={personal} reverse />
          </motion.div>
        </AnimatedSection>
      </div>
    </Section>
  );
}
