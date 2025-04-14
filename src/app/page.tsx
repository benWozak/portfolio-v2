// import AnimatedHome from "@/components/layout/AnimatedHome";
import { HeroFreelance } from "@/components/layout";
import { Projects, Pitch } from "@/components/content";
import ContactCTA from "@/components/content/contact/ContactCTA";

export default function Home() {
  return (
    // <AnimatedHome>
    <article className="flex min-h-screen flex-col items-center justify-center">
      {/* <Hero /> */}
      <HeroFreelance />
      <Pitch />
      <Projects />
      <ContactCTA />
    </article>
    // {/* </AnimatedHome> */}
  );
}
