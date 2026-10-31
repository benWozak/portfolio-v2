// src/app/(app)/projects/[slug]/page.tsx
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/layout/section/SectionHeading";
import { BackButton } from "@/components/ui/BackButton";
import { getProjectBySlug, getProjectSlugs } from "@/lib/projects";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.seo?.title ?? `${project.name} | Projects`,
    description: project.seo?.description ?? project.description,
    openGraph: { images: [project.image.src] },
  };
}

const PARAGRAPH = "text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line";
const HEADING = "text-2xl font-semibold mb-4";

export default async function ProjectPage({ params }: { params: Params }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const stackGroups = [
    ["Frontend", project.techStack.frontend],
    ["Backend", project.techStack.backend],
    ["Other", project.techStack.other],
  ] as const;

  return (
    <div className="container mx-auto px-4">
      <SectionHeading title={project.name} />
      <BackButton />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Image
            src={project.image.src}
            alt={project.image.alt}
            width={project.image.width}
            height={project.image.height}
            placeholder="blur"
            blurDataURL={project.image.blurDataURL}
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="rounded-md w-full h-auto"
          />

          <section>
            <h2 className={HEADING}>Overview</h2>
            <p className={PARAGRAPH}>{project.overview}</p>
          </section>
          <section>
            <h2 className={HEADING}>Challenge</h2>
            <p className={PARAGRAPH}>{project.challenge}</p>
          </section>
          <section>
            <h2 className={HEADING}>Solution</h2>
            <p className={PARAGRAPH}>{project.solution}</p>
          </section>
          <section>
            <h2 className={HEADING}>Key Takeaways</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
              {project.keyTakeaways.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          {project.sections?.map((section) => (
            <section key={section.heading}>
              <h2 className={HEADING}>{section.heading}</h2>
              <p className={PARAGRAPH}>{section.body}</p>
            </section>
          ))}
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            <section>
              <h2 className={HEADING}>Tech Stack</h2>
              <div className="space-y-6">
                {stackGroups
                  .filter(([, items]) => items.length > 0)
                  .map(([label, items]) => (
                    <div key={label}>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{label}</h3>
                      <ul className="space-y-1">
                        {items.map((tech) => (
                          <li key={tech} className="text-gray-600 dark:text-gray-300 text-sm">
                            • {tech}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
            </section>

            <section>
              <div className="space-y-3">
                {project.liveUrl && (
                  <Link
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring block w-full bg-primary-500 text-primary-foreground px-4 py-3 rounded-md hover:bg-primary-600 transition-colors text-center font-medium"
                  >
                    Live Demo
                  </Link>
                )}
                {project.githubUrl && (
                  <Link
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring block w-full bg-secondary-400 dark:bg-secondary-600 text-foreground px-4 py-3 rounded-md hover:bg-secondary-600 hover:dark:bg-secondary-800 transition-colors text-center font-medium"
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
        </aside>
      </div>
    </div>
  );
}
