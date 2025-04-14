import React from "react";
import { AnimatedSection } from "../../layout/section/AnimatedSection";
import { CTAButton } from "@/components/ui";

type Props = {};

function ContactCTA({}: Props) {
  return (
    <section>
      <AnimatedSection className="px-4">
        <div className="container flex flex-col items-center px-4 py-12 mx-auto text-center">
          <h2 className="max-w-2xl mx-auto text-2xl font-semibold tracking-tight text-gray-800 xl:text-3xl dark:text-white">
            Bring your idea or business to the{" "}
            <span className="text-primary-500">next level.</span>
          </h2>

          <p className="max-w-2xl mt-6 text-center text-gray-500 dark:text-gray-300">
            Your vision, expertly developed - from concept to completion.
            Transforming innovative ideas into impactful digital experiences.
          </p>

          <div className="inline-flex mt-6 w-auto">
            <CTAButton href="/contact">Get In Touch</CTAButton>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}

export default ContactCTA;
