import { getProjects } from "@/lib/projects";
import { ProjectsGrid } from "@/components/content/projects/ProjectsGrid";

export default function MobileProjectsPage() {
  const projects = getProjects().filter((project) => project.type === "native");
  return <ProjectsGrid projects={projects} />;
}
