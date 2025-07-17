import { Hero } from "@/components/layout";
import {
  Projects,
  // Pitch
  About,
  Experience,
} from "@/components/content";
import ContactCTA from "@/components/content/contact/ContactCTA";

export default async function Home() {
  return (
    <article className="flex min-h-screen flex-col items-center justify-center">
      <Hero />
      {/* <Pitch /> */}
      <About />
      <Projects />
      <Experience />
      <ContactCTA />
    </article>
  );
}
