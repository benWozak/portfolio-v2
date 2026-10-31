export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <article className='container mx-auto my-16 px-4 lg:py-8'>
      {children}
    </article>
  );
}
