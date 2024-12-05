import React from "react";
import Section from "../layout/section";
import Image from "next/image";

export function About() {
  return (
    <Section id="about" title="About Me">
      <div className="flex gap-12 flex-col lg:flex-row lg:px-2 mb-4 px-8">
        <div className="">
          <Image
            src="/Ben_Black-White.jpg"
            alt="photo of Ben Wozak"
            width={300}
            height={300}
            className="rounded-2xl"
          />
        </div>
        <div className="max-w-xl">
          <p className="text-sm md:text-base lg:text-xl mb-4">
            I am a Software Developer with 6 years of professional experience
            crafting user-interfaces for B2B SaaS product and high traffic
            client-facing websites, I am specialized in all things JavaScript,
            creating elegant user experiences for complex software solutions
            with a proven track record leading cross-functional teams in fast
            paced environments.
          </p>
          <p className="text-sm md:text-base lg:text-xl">
            Driven by a passion for coding excellence, I thrive on pushing the
            boundaries of what&#39;s possible in web development. Always eager
            to embrace new technologies, I try to stay at the forefront of web
            development trends to deliver state-of-the-art solutions for clients
            and users alike.
          </p>
        </div>
      </div>
    </Section>
  );
}
