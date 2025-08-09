import { getProjects } from "@/utils/getProjects";
import { ProjectsGrid } from "@/components/content/projects/ProjectsGrid";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return <ProjectsGrid projects={projects} />;
}
