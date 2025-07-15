import { SectionHeading } from "@/components/layout/section/SectionHeading";
import { getProjectsServer, getProjectByNameServer } from "@/utils/getProjectsServer";
import { LivePreviewToolbar } from "@/components/layout";
import Link from "next/link";
import { Metadata } from "next";
import { draftMode } from "next/headers";
import MediaContainer from "@/components/content/projects/MediaContainer";

type Params = Promise<{ name: string }>;

export async function generateStaticParams() {
  const projects = await getProjectsServer();
  return projects.map((project) => ({
    name: project.name.toLowerCase().replace(/\s+/g, "-"),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { name } = await params;
  const projectName = name.replace(/-/g, " ");
  const project = await getProjectByNameServer(projectName);

  return {
    title: project ? `${project.name} | Projects` : "Project Not Found",
    description: project
      ? project.description
      : "Project details not available",
  };
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { name } = await params;
  const projectName = name.replace(/-/g, " ");
  const { isEnabled } = await draftMode();
  const project = await getProjectByNameServer(projectName);

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <>
      <LivePreviewToolbar 
        isDraftMode={isEnabled} 
        collection="projects" 
        id={project.id?.toString()} 
        slug={name}
      />
      <div className={`container mx-auto px-4 py-16 lg:pt-24 ${isEnabled ? 'pt-20' : ''}`}>
        <SectionHeading title={project.name} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <MediaContainer project={project} />
          <div>
            {/* <h1 className="text-3xl font-bold mb-4">{project.name}</h1> */}
            <h2 className="text-2xl font-semibold mb-4">Description</h2>
            <p className="text-gray-600 dark:text-gray-200 mb-6">
              {project.description}
            </p>
            <h2 className="text-2xl font-semibold mb-4">Concept</h2>
            <p className="text-gray-600 dark:text-gray-200 mb-6">
              {project.content.concept}
            </p>
            <h2 className="text-2xl font-semibold mb-4">Solution</h2>
            <p className="text-gray-600 dark:text-gray-200 mb-6">
              {project.content.solution}
            </p>
            {!project?.githubUrl && (
              <i className="text-sm font-medium text-gray-500 dark:text-gray-400">
                I do not own the rights to the code for this project.
              </i>
            )}
            <div className="flex space-x-4">
              {!!project.liveUrl ? (
                <Link
                  href={project.liveUrl || ""}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary-500 text-primary-foreground px-4 py-2 rounded-md hover:bg-primary-600 transition-colors"
                >
                  Live Demo
                </Link>
              ) : null}
              {project.githubUrl ? (
                <Link
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-secondary-400 dark:bg-secondary-600 text-foreground px-4 py-2 rounded-md hover:bg-secondary-600 hover:dark:bg-secondary-800 transition-colors"
                >
                  View Code
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
