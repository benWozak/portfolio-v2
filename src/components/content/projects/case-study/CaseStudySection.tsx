// src/components/content/projects/case-study/CaseStudySection.tsx
interface Props {
  id: string;
  heading: string;
  children: React.ReactNode;
}

export function CaseStudySection({ id, heading, children }: Props) {
  return (
    <section aria-labelledby={id}>
      <div className="mb-6 flex items-center gap-4">
        <span aria-hidden="true" className="h-0.5 w-8 rounded-full bg-primary lg:h-1 lg:w-16" />
        <h2 id={id} className="text-2xl font-bold uppercase tracking-wider">
          {heading}
        </h2>
      </div>
      {children}
    </section>
  );
}
