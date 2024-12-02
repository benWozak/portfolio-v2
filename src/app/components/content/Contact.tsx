import React from "react";
import Section from "../layout/section";
import ContactForm from "./ContactForm";

type Props = {};

export function Contact({}: Props) {
  return (
    <Section id="contact" title="Contact">
      <ContactForm />
    </Section>
  );
}
