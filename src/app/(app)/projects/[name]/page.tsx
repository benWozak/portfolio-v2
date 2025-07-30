import { SectionHeading } from "@/components/layout/section/SectionHeading";
import { LivePreviewToolbar } from "@/components/layout";
import Link from "next/link";
import { Metadata } from "next";
import { draftMode } from "next/headers";
import MediaContainer from "@/components/content/projects/MediaContainer";
import { BackButton } from "@/components/ui/BackButton";

type Params = Promise<{ name: string }>;

export async function generateStaticParams() {
  try {
    const { getProjectsServer } = await import("@/utils/getProjectsServer");
    const projects = await getProjectsServer();

    return projects.map((project) => ({
      name: project.name.toLowerCase().replace(/\s+/g, "-"),
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { name } = await params;

  try {
    const { getProjectByNameServer } = await import(
      "@/utils/getProjectsServer"
    );
    const { isEnabled } = await draftMode();
    const project = await getProjectByNameServer(
      name.replace(/-/g, " "),
      isEnabled
    );

    return {
      title: `${project?.name || name} | Projects`,
      description: project?.description || `Project details for ${name}`,
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: `${name} | Projects`,
      description: `Project details for ${name}`,
    };
  }
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { name } = await params;
  const { isEnabled } = await draftMode();

  // Import here to avoid build issues
  const { getProjectByNameServer } = await import("@/utils/getProjectsServer");
  const project = await getProjectByNameServer(
    name.replace(/-/g, " "),
    isEnabled
  );

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
      <div className={`container mx-auto px-4 ${isEnabled ? "pt-20" : ""}`}>
        <SectionHeading title={project.name} />
        <BackButton />

        <div className="space-y-12">
          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Left Side (2/3) */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex justify-center">
                <MediaContainer project={project} />
              </div>
              {/* Overview */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Overview</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {project.overview}
                </p>
              </section>

              {/* Challenge */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Challenge</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {project.challenge}
                </p>
              </section>

              {/* Solution */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Solution</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {project.solution}
                </p>
              </section>

              {/* Key Takeaways */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Key Takeaways</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {project.keyTakeaways}
                </p>
              </section>
            </div>

            {/* Sidebar - Right Side (1/3) */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-8">
                {/* Tech Stack */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Tech Stack</h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-3 text-gray-900 dark:text-gray-100">
                        Frontend
                      </h3>
                      <ul className="space-y-1">
                        {project.techStack.frontend.map((tech, index) => (
                          <li
                            key={index}
                            className="text-gray-600 dark:text-gray-300 text-sm"
                          >
                            • {tech}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-medium mb-3 text-gray-900 dark:text-gray-100">
                        Backend
                      </h3>
                      <ul className="space-y-1">
                        {project.techStack.backend.map((tech, index) => (
                          <li
                            key={index}
                            className="text-gray-600 dark:text-gray-300 text-sm"
                          >
                            • {tech}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-medium mb-3 text-gray-900 dark:text-gray-100">
                        Other
                      </h3>
                      <ul className="space-y-1">
                        {project.techStack.other.map((tech, index) => (
                          <li
                            key={index}
                            className="text-gray-600 dark:text-gray-300 text-sm"
                          >
                            • {tech}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Action Buttons */}
                <section>
                  <div className="space-y-3">
                    {project.liveUrl && (
                      <Link
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-primary-500 text-primary-foreground px-4 py-3 rounded-md hover:bg-primary-600 transition-colors text-center font-medium"
                      >
                        Live Demo
                      </Link>
                    )}
                    {project.githubUrl && (
                      <Link
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-secondary-400 dark:bg-secondary-600 text-foreground px-4 py-3 rounded-md hover:bg-secondary-600 hover:dark:bg-secondary-800 transition-colors text-center font-medium"
                      >
                        View Code
                      </Link>
                    )}
                  </div>

                  {!project.githubUrl && (
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-4 italic">
                      I do not own the rights to the code for this project.
                    </p>
                  )}
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
