// src/app/(app)/projects/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnimatedSection } from "@/components/layout/section/AnimatedSection";
import { Markdown } from "@/components/content/markdown/Markdown";
import { PROJECT_GROUPS } from "@/components/content/projects/groups";
import { CaseStudyHero } from "@/components/content/projects/case-study/CaseStudyHero";
import { CaseStudySection } from "@/components/content/projects/case-study/CaseStudySection";
import { CaseStudySidebar } from "@/components/content/projects/case-study/CaseStudySidebar";
import { KeyTakeaways } from "@/components/content/projects/case-study/KeyTakeaways";
import { ProjectPagination } from "@/components/content/projects/case-study/ProjectPagination";
import { Reveal } from "@/components/content/projects/case-study/Reveal";
import { getAdjacentProjects, getProjectBySlug, getProjectSlugs } from "@/lib/projects";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  const title = project.seo?.title ?? project.name;
  const description = project.seo?.description ?? project.description;
  const image = { url: project.image.src, width: project.image.width, height: project.image.height, alt: project.image.alt };
  return {
    // seo.title is a full <title> override; project.name takes the root "%s | Ben Wozak" template.
    title: project.seo?.title ? { absolute: project.seo.title } : project.name,
    description,
    // Replaces the root layout's openGraph block wholesale, so restate type, siteName, locale and url.
    openGraph: {
      type: "article",
      siteName: "Ben Wozaks Portfolio",
      locale: "en_US",
      url: `/projects/${slug}`,
      title,
      description,
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [project.image.src] },
  };
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();
  const { prev, next } = getAdjacentProjects(slug);
  const group = PROJECT_GROUPS[project.type];

  const sections = [
    { id: "overview", heading: "Overview", body: project.overview },
    { id: "challenge", heading: "Challenge", body: project.challenge },
    { id: "solution", heading: "Solution", body: project.solution },
  ];

  return (
    <>
      <CaseStudyHero project={project} />

      <div className="lg:grid lg:grid-cols-3 lg:gap-12">
        {/* DOM order: details, then the story. Below lg that is also the visual order. */}
        <CaseStudySidebar
          project={project}
          className="mb-12 lg:col-start-3 lg:row-start-1 lg:mb-0 lg:sticky lg:top-24 lg:self-start"
        />

        <div className="space-y-16 lg:col-span-2 lg:col-start-1 lg:row-start-1">
          {sections.map((s) => (
            <AnimatedSection key={s.id}>
              <Reveal>
                <CaseStudySection id={s.id} heading={s.heading}>
                  <Markdown>{s.body}</Markdown>
                </CaseStudySection>
              </Reveal>
            </AnimatedSection>
          ))}

          <AnimatedSection>
            <Reveal>
              <KeyTakeaways items={project.keyTakeaways} />
            </Reveal>
          </AnimatedSection>

          {project.sections?.map((s, i) => (
            <AnimatedSection key={`${i}-${s.heading}`}>
              <Reveal>
                <CaseStudySection id={`extra-${i}`} heading={s.heading}>
                  <Markdown>{s.body}</Markdown>
                </CaseStudySection>
              </Reveal>
            </AnimatedSection>
          ))}
        </div>
      </div>

      <ProjectPagination prev={prev} next={next} group={group} />
    </>
  );
}
