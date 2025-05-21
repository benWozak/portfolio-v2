import {
  About,
  Services,
  Experience,
  TechnologyShowcase,
} from "@/components/content";

export default function Page() {
  return (
    <article>
      <About />
      {/* <TechnologyShowcase /> */}
      <Services />
      <Experience />
    </article>
  );
}
