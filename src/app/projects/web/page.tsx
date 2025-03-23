import { getProjects } from "@/utils/getProjects";
import { ProjectCard } from "@/components/content/projects/ProjectCard";
import { SectionHeading } from "@/components/layout/section/SectionHeading";

export default async function WebProjectsPage() {
  const allProjects = await getProjects();
  const webProjects = allProjects.filter((project) => project.type === "web");

  return (
    <div className="container mx-auto px-4 py-8">
      <SectionHeading title="Web Projects" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {webProjects.map((project, index) => (
          <ProjectCard key={project.id} index={index} project={project} />
        ))}
      </div>
    </div>
  );
}
