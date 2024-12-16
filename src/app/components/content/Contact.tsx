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
          className="text-sm md:text-md lg:text-xl lg:px-2 mb-8 px-8 max-w-2xl"
          variants={itemVariants}
        >
          Whether you have a project in mind or just want to chat about tech,
          I&#39;m always eager to collaborate. Also feel free to check out my
          GitHub or LinkedIn: <Socials />
        </motion.div>

        <motion.div className="w-full px-4 lg:px-0" variants={itemVariants}>
          <ContactForm />
        </motion.div>
      </AnimatedSection>
    </Section>
  );
}
