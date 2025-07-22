import { SectionHeading } from "@/components/layout/section/SectionHeading";
import { LivePreviewToolbar } from "@/components/layout";
import Link from "next/link";
import { Metadata } from "next";
import { draftMode } from "next/headers";
import MediaContainer from "@/components/content/projects/MediaContainer";
import { BackButton } from "@/components/ui/BackButton";

type Params = Promise<{ name: string }>;

// Dummy project data
const dummyProject = {
  id: 1,
  name: "Calgary Folk Fest",
  type: "web" as const,
  status: "Professional" as const,
  description:
    "A website for a local music festival with over 40 years of rich history in the heart of downtown Calgary, AB.",
  overview:
    "A website for a local music festival with over 40 years of rich history in the heart of downtown Calgary, AB. I was the lead developer responsible for architecture, infrastructure, and front-end development.",
  challenge:
    "The existing website for this iconic local festival was outdated and couldn't support their growing content needs. The primary challenge was to deliver a complete digital refresh that matched its cultural significance, re-imagining a site with extensive, complex content while working under tight deadlines.",
  solution:
    "As part of a small, agile team, we built a brand new solution from the ground up. I spearheaded the technical approach, opting for a modern stack to ensure scalability and ease of content management. Key decisions included implementing a headless architecture with StrapiCMS which allowed for flexible content modeling and an API-first approach that could support future mobile applications and integrations. I designed a component-based system for optimal user experience. This decoupled setup allowed us to build a highly interactive and fast user interface, hosted on AWS for reliability. I was also responsible for developing the front-end, from component architecture to final implementation.",
  techStack: {
    frontend: ["Next.js", "React", "Tailwind CSS", "TypeScript"],
    backend: ["StrapiCMS", "MySQL", "AWS (S3, EC2)"],
    other: ["Figma", "Vercel", "Docker"],
  },
  keyTakeaways:
    "This project was a fantastic learning experience. It sharpened my skills in architecting scalable front-end systems and solidified my expertise with the Next.js framework. One of the main challenges was migrating a vast amount of legacy content, which required careful planning and scripting. The result was a significantly faster, more user-friendly website that saw a measurable increase in user engagement and ticket sales during the festival season.",
  liveUrl: "https://calgaryfolkfest.com",
  githubUrl: null,
  media: {
    staticImage: "/projects/calgary-folk-fest.jpg",
    video: "/projects/calgary-folk-fest.mp4",
  },
};

export async function generateStaticParams() {
  try {
    const { getProjectsServer } = await import("@/utils/getProjectsServer");
    const projects = await getProjectsServer();

    return projects.map((project) => ({
      name: project.name.toLowerCase().replace(/\s+/g, "-"),
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    // Fallback to dummy project
    return [
      {
        name: "calgary-folk-fest",
      },
    ];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { name } = await params;

  return {
    title: `${name} | Projects`,
    description: dummyProject.description,
  };
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { name } = await params;
  const { isEnabled } = await draftMode();

  // Import here to avoid build issues
  const { getProjectByNameServer } = await import("@/utils/getProjectsServer");
  const project =
    (await getProjectByNameServer(name.replace(/-/g, " "), isEnabled)) ||
    dummyProject;

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
      <div
        className={`container mx-auto px-4 py-16 lg:pt-24 ${isEnabled ? "pt-20" : ""}`}
      >
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
                        Backend & Hosting
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
                        Other Tools
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
