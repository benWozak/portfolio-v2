import { getProjects } from "@/utils/getProjects";
import { ProjectCard } from "@/components/content/projects/ProjectCard";
import { SectionHeading } from "@/components/layout/section/SectionHeading";

export default async function MobileProjectsPage() {
  const allProjects = await getProjects();
  const mobileProjects = allProjects.filter(
    (project) => project.type === "native"
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <SectionHeading title="Native Apps" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mobileProjects.map((project, index) => (
          <ProjectCard key={project.id} index={index} project={project} />
        ))}
      </div>
    </div>
  );
}
