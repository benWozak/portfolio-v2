import { getProjects } from "@/utils/getProjects";
import { ProjectCard } from "../components/content/projects/ProjectCard";
import { SectionHeading } from "../components/layout/section/SectionHeading";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="container mx-auto px-4 py-16 lg:py-8">
      <SectionHeading title="Projects" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {projects.slice(0, 4).map((project, index) => (
          <ProjectCard key={index} index={index} project={project} />
        ))}
      </div>
    </div>
  );
}
