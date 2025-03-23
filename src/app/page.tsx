import AnimatedHome from "@/components/layout/AnimatedHome";
import { Hero } from "@/components/layout";
import { About, Projects, Contact, Experience } from "@/components/content";

export default function Home() {
  return (
    <AnimatedHome>
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Contact />
      </div>
    </AnimatedHome>
  );
}
