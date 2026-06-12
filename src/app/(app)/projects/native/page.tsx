import { getProjects } from "@/utils/getProjects";
import { ProjectsGrid } from "@/components/content/projects/ProjectsGrid";

export default async function MobileProjectsPage() {
  const projects = (await getProjects()).filter(
    (project) => project.type === "native"
  );

  return <ProjectsGrid projects={projects} />;
}
