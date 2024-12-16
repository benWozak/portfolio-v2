"use client";
import React from "react";
import Section from "../layout/section";
import Image from "next/image";
import {
  AnimatedSection,
  itemVariants,
} from "../layout/section/AnimatedSection";
import { motion } from "framer-motion";

export function About() {
  return (
    <Section id="about" title="About Me">
      <AnimatedSection className="flex gap-12 flex-col lg:flex-row lg:px-2 mb-4 px-8">
        <motion.div variants={itemVariants}>
          <Image
            src="/Pastel_Ben.jpg"
            alt="photo of Ben Wozak"
            width={475}
            height={300}
            className="rounded-2xl"
          />
        </motion.div>
        <motion.div className="max-w-xl" variants={itemVariants}>
          <p className="text-sm md:text-base lg:text-xl mb-4">
            I am a Software Developer with 6 years of professional experience
            crafting user-interfaces for B2B SaaS product and high traffic
            client-facing websites. I am specialized in all things JavaScript,
            creating elegant user experiences with complex software solutions.
          </p>
          <p className="text-sm md:text-base lg:text-xl">
            Driven by curiosity and a passion for excellence, I try to stay at
            the forefront of web development trends to deliver state-of-the-art
            solutions for clients, businesses and users alike.
          </p>
        </motion.div>
      </AnimatedSection>
    </Section>
  );
}
