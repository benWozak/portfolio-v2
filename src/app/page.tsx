import AnimatedHome from "./components/layout/AnimatedHome";
import { Hero } from "./components/layout";

export default function Home() {
  return (
    // <AnimatedHome>
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Hero />
      <div className="">
        <p className="text-xl max-w-2xl mb-12">
          I am a Software Developer with now over five years of professional
          experience crafting user-interfaces for B2B SaaS product and high
          traffic client-facing websites, I am specialized in all things
          JavaScript, creating elegant user experiences for complex software
          solutions with a proven track record leading cross-functional teams in
          fast paced environments.
        </p>
        <p className="text-xl max-w-2xl mb-12">
          Driven by a passion for coding excellence, I thrive on pushing the
          boundaries of what's possible in web development. I'm an active
          contributor to the global software community, believing in the power
          of collaboration to accelerate innovation.
        </p>
        <p className="text-xl max-w-2xl mb-12">
          Always eager to embrace new technologies, I try to stay at the
          forefront of web development trends to deliver state-of-the-art
          solutions for clients and users alike.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center p-6 bg-secondary-bg rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2 text-primary">
            Developer
          </h2>
          <p>Crafting efficient and scalable code solutions</p>
        </div>
        <div className="text-center p-6 bg-secondary-bg rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2 text-primary">Designer</h2>
          <p>Creating intuitive and visually appealing interfaces</p>
        </div>
        <div className="text-center p-6 bg-secondary-bg rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2 text-primary">
            Freelancer
          </h2>
          <p>Delivering high-quality projects on time and on budget</p>
        </div>
      </div>
    </div>
    // </AnimatedHome>
  );
}
