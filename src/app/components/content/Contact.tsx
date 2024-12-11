import React from "react";
import Section from "../layout/section";
import ContactForm from "./ContactForm";
import { Socials } from "./Socials";

export function Contact() {
  return (
    <Section id="contact" title="Contact">
      <div className="w-full flex justify-center">
        <div className="text-sm md:text-md lg:text-xl lg:px-2 mb-8 px-8 max-w-2xl">
          Whether you have a project in mind or just want to chat about tech,
          I&#39;m always eager to collaborate. Also feel free to check out my
          GitHub or LinkedIn: <Socials />
        </div>
      </div>

      <ContactForm />
    </Section>
  );
}
