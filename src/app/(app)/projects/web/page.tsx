import { getProjects } from "@/lib/projects";
import { ProjectsGrid } from "@/components/content/projects/ProjectsGrid";

export default function WebProjectsPage() {
  const projects = getProjects().filter((project) => project.type === "web");
  return <ProjectsGrid projects={projects} />;
}
