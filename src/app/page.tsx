import AnimatedHome from "@/components/layout/AnimatedHome";
import { Hero } from "@/components/layout";
import { About, Services, Projects, Experience } from "@/components/content";

export default function Home() {
  return (
    <AnimatedHome>
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Hero />
        <About />
        <Services />
        <Experience />
        <Projects />
      </div>
    </AnimatedHome>
  );
}
