import { Hero } from "./components/layout";
import { About, Services, Projects, Contact } from "./components/content";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Hero />
      <About />
      <Services />
      <Projects />
      <Contact />
    </div>
  );
}
