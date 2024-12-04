import { Hero } from "./components/layout";
import {
  About,
  // Services,
  Projects,
  Contact,
  Experience,
} from "./components/content";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Hero />
      <About />
      <Experience />
      {/* <Services /> */}
      <Projects />
      <Contact />
    </div>
  );
}
