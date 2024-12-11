import { SectionHeading } from "@/app/components/layout/section/SectionHeading";
import { getProjects, getProjectByName } from "@/utils/getProjects";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

type Params = Promise<{ name: string }>;

export async function generateStaticParams() {
  const projects = await getProjects();
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
  const project = await getProjectByName(projectName);

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
  const project = await getProjectByName(projectName);

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SectionHeading title="Projects" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {project.media.endsWith(".mp4") ? (
            <video
              src={project.media}
              className="w-full rounded-lg shadow-md"
              controls
              playsInline
            />
          ) : (
            <Image
              src={project.media}
              alt={project.name}
              width={800}
              height={600}
              className="rounded-lg shadow-md"
            />
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{project.name}</h1>
          <h2 className="text-2xl font-semibold mb-4">Description</h2>
          <p className="text-gray-600 mb-6">{project.description}</p>
          <h2 className="text-2xl font-semibold mb-4">Problem</h2>
          <p className="text-gray-600 mb-6">{project.content.problem}</p>
          <h2 className="text-2xl font-semibold mb-4">Solution</h2>
          <p className="text-gray-600 mb-6">{project.content.solution}</p>
          <div className="flex space-x-4">
            <Link
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors"
            >
              Live Demo
            </Link>
            <Link
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-secondary-800 text-white px-4 py-2 rounded-md hover:bg-secondary-900 transition-colors"
            >
              GitHub Repo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
