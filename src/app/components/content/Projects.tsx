import React from "react";
import Section from "../layout/section";
import { getProjects } from "@/utils/getProjects";
import { CTAButton } from "../ui";
import { ProjectCard } from "../content/projects/ProjectCard";

export async function Projects() {
  const projects = await getProjects();
  return (
    <Section
      id="projects"
      title="Projects"
      className="flex items-center flex-1"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:px-0">
        {projects.slice(0, 2).map((project, index) => (
          <ProjectCard key={index} index={index} project={project} />
        ))}
      </div>
      <div className="mt-8 lg:mt-16 flex justify-center">
        <CTAButton href="/projects" className="w-72">
          See More
        </CTAButton>
      </div>
    </Section>
  );
}
