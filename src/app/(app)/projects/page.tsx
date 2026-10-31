import { getProjects } from "@/lib/projects";
import { ProjectsGrid } from "@/components/content/projects/ProjectsGrid";

export default function ProjectsPage() {
  const projects = getProjects();
  return <ProjectsGrid projects={projects} />;
}
