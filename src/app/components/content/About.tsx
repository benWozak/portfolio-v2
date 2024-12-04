import React from "react";
import Section from "../layout/section";

type Props = {};

export function About({}: Props) {
  return (
    <Section id="about" title="About Me">
      <p className="text-sm md:text-md lg:text-xl lg:px-2 mb-4 px-8">
        I am a Software Developer with 6 years of professional experience
        crafting user-interfaces for B2B SaaS product and high traffic
        client-facing websites, I am specialized in all things JavaScript,
        creating elegant user experiences for complex software solutions with a
        proven track record leading cross-functional teams in fast paced
        environments.
      </p>
      <p className="text-sm md:text-md lg:text-xl lg:px-2 mb-4 px-8">
        Driven by a passion for coding excellence, I thrive on pushing the
        boundaries of what's possible in web development. I'm an active
        contributor to the global software community, believing in the power of
        collaboration to accelerate innovation.
      </p>
      <p className="text-sm md:text-md lg:text-xl lg:px-2 mb-4 px-8">
        Always eager to embrace new technologies, I try to stay at the forefront
        of web development trends to deliver state-of-the-art solutions for
        clients and users alike.
      </p>
    </Section>
  );
}
