import { TechnologyShowcase } from "../content";
import { CTAButton } from "../ui";

export function Hero() {
  return (
    <section className="relative h-auto  w-full flex flex-col  items-center pt-28 lg:pt-32 mb-32">
      <div className="absolute h-[20%] w-[20%] top-[20%] left-[50%] -translate-x-1/2 bg-primary rounded-full blur-[110px]"></div>
      <h1 className="w-full text-3xl md:text-4xl lg:text-6xl max-w-3xl  font-bold  text-center">
        Transforming Ideas
      </h1>
      <h1 className="w-full text-2xl md:text-3xl lg:text-3xl max-w-3xl  font-bold  text-center mt-3 px-4">
        Into <span className="text-primary">Polished</span> Web Experiences
      </h1>
      <p className="text-center lg:text-xl text-foreground mt-6 lg:mt-10 px-4 max-w-xl">
        {/* Combining clean design with powerful functionality to help you stand out
        online. */}
        As a full-stack software developer focused on creating elegant
        user-interfaces with the most modern web technologies
      </p>
      <div className="mt-6 lg:mt-8">
        <CTAButton href="#contact">Get in Touch</CTAButton>
      </div>
      <div className=" flex flex-wrap gap-5 md:flex md:flex-row items-center justify-center lg:h-24 h-auto w-[80%] lg:mx-auto mx-2 my-6 lg:my-8">
        <TechnologyShowcase />
      </div>
    </section>
  );
}
