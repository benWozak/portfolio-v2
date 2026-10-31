import { Hero } from "@/components/layout";
import {
  Projects,
  // Pitch
  About,
  Experience,
} from "@/components/content";
import ContactCTA from "@/components/content/contact/ContactCTA";
import { getFeaturedProject } from "@/lib/projects";

export default async function Home() {
  const professional = getFeaturedProject("professional");
  const personal = getFeaturedProject("personal");

  return (
    <article className="flex min-h-screen flex-col items-center justify-center">
      <Hero />
      {/* <Pitch /> */}
      <About />
      {professional && personal && <Projects professional={professional} personal={personal} />}
      <Experience />
      <ContactCTA />
    </article>
  );
}
