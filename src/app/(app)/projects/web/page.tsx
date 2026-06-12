import { getProjects } from "@/utils/getProjects";
import { ProjectsGrid } from "@/components/content/projects/ProjectsGrid";

export default async function WebProjectsPage() {
  const projects = (await getProjects()).filter(
    (project) => project.type === "web"
  );

  return <ProjectsGrid projects={projects} />;
}
