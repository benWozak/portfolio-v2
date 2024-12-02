import React from "react";
import { SectionHeading } from "../layout/SectionHeading";
import ContactForm from "./ContactForm";

type Props = {};

export function Contact({}: Props) {
  return (
    <section id="contact" className="max-w-4xl mb-16">
      <SectionHeading title="Contact" />
      {/* <ContactForm /> */}
    </section>
  );
}
