"use client";
import React from "react";
import Section from "../../components/layout/section";
import ContactForm from "../../components/content/contact/ContactForm";
import {
  AnimatedSection,
  itemVariants,
} from "../../components/layout/section/AnimatedSection";
import { motion } from "framer-motion";
import { LinkButton } from "../../components/ui";

export default function Contact() {
  return (
    <Section id="contact" title="Contact" className="pt-32">
      <AnimatedSection className="w-full flex flex-col items-center">
        <motion.div
          className="md:text-lg lg:text-xl lg:px-2 mb-4 px-8 max-w-2xl text-gray-800 dark:text-gray-200"
          variants={itemVariants}
        >
          <span className="text-primary-500 font-bold">
            I'm currently available for freelance work
          </span>{" "}
          — whether you need help shipping a feature, building a full app, or
          just want a second set of eyes on your code, let's chat.
          <br />
          <br />
          Feel free to reach out using the form below, or connect with me on{" "}
          <LinkButton
            href="https://github.com/benWozak"
            className="md:text-lg lg:text-xl text-secondary-600 dark:text-secondary-500"
            target="_blank"
          >
            GitHub
          </LinkButton>{" "}
          or{" "}
          <LinkButton
            href="https://linkedin.com/in/ben-wozak"
            className="md:text-lg lg:text-xl text-secondary-600 dark:text-secondary-500"
            target="_blank"
          >
            LinkedIn
          </LinkButton>
          .
        </motion.div>

        <motion.div className="w-full px-4 lg:px-0" variants={itemVariants}>
          <ContactForm />
        </motion.div>
      </AnimatedSection>
    </Section>
  );
}
