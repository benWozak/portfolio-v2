"use client";
import React from "react";
import Section from "../layout/section";
import ContactForm from "./ContactForm";
import { Socials } from "./Socials";
import {
  AnimatedSection,
  itemVariants,
} from "../layout/section/AnimatedSection";
import { motion } from "framer-motion";

export function Contact() {
  return (
    <Section id="contact" title="Contact">
      <AnimatedSection className="w-full flex flex-col items-center">
        <motion.div
          className="lg:text-xl lg:px-2 mb-8 px-8 max-w-2xl text-gray-800 dark:text-gray-200"
          variants={itemVariants}
        >
          I&#39;m always open to new opportunities and would love to discuss how
          my skills and experience could benefit your team. Feel free to reach
          out through the form below, or connect with me on GitHub or LinkedIn.
          <br />
          <Socials size="xl" />
        </motion.div>

        <motion.div className="w-full px-4 lg:px-0" variants={itemVariants}>
          <ContactForm />
        </motion.div>
      </AnimatedSection>
    </Section>
  );
}
