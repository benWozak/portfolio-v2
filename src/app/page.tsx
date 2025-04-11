import AnimatedHome from "@/components/layout/AnimatedHome";
import { Hero } from "@/components/layout";
import { Projects, Pitch } from "@/components/content";
import ContactCTA from "@/components/content/contact/ContactCTA";

export default function Home() {
  return (
    <AnimatedHome>
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Hero />
        <Pitch />
        <Projects />
        <ContactCTA />
      </div>
    </AnimatedHome>
  );
}
