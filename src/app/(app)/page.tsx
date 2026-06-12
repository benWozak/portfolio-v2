import { Hero } from "@/components/layout";
import {
  Projects,
  // Pitch
  About,
  Experience,
} from "@/components/content";
import ContactCTA from "@/components/content/contact/ContactCTA";
import { getProjects } from "@/utils/getProjects";

export default async function Home() {
  const projects = (await getProjects()).slice(0, 2);

  return (
    <article className="flex min-h-screen flex-col items-center justify-center">
      <Hero />
      {/* <Pitch /> */}
      <About />
      <Projects projects={projects} />
      <Experience />
      <ContactCTA />
    </article>
  );
}
