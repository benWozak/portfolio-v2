import React from "react";
import Section from "../layout/section";
import ContactForm from "./ContactForm";

type Props = {};

export function Contact({}: Props) {
  return (
    <Section id="contact" title="Contact">
      <div className="w-full flex justify-center">
        <p className="text-sm md:text-md lg:text-xl lg:px-2 mb-8 px-8 max-w-2xl">
          Ready to bring your digital vision to life? Whether you have a project
          in mind or just want to chat about tech, I'm all ears and eager to
          collaborate.
        </p>
      </div>

      <ContactForm />
    </Section>
  );
}
