import { About, Services, Experience } from "@/components/content";

export default function Page() {
  return (
    <article className="mt-8 md:mt-16">
      <About />
      <Services />
      <Experience />
    </article>
  );
}
