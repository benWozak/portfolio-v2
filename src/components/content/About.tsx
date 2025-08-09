"use client";
import React from "react";
import Section from "../layout/section";
import {
  AnimatedSection,
  itemVariants,
} from "../layout/section/AnimatedSection";
import { motion } from "framer-motion";
import { Globe } from "../magicui/globe";

export function About() {
  return (
    <Section id="about" title="About Me">
      <AnimatedSection className="flex gap-12 flex-col lg:flex-row mb-4 px-4 lg:px-2">
        <motion.div variants={itemVariants}>
          <div className="relative flex size-full max-w-lg items-center justify-center overflow-hidden px-40 py-44 md:pt-8 md:pb-60">
            <Globe className="top-0 md:top-4 dark:invert" />
          </div>
        </motion.div>
        <motion.div className="max-w-xl" variants={itemVariants}>
          <p className="lg:text-lg mb-8">
            I&apos;m a software engineer from Calgary Alberta relocating to San
            Diego, California. I specialize in building modern, user-friendly
            web applications that solve real-world problems. With a passion for
            clean code and a focus on performance, I create scalable solutions
            that enhance user experience and drive business success.
          </p>
          <p className="lg:text-lg mb-8">
            Backed by years of industry experience building polished UIs for B2B
            SaaS platforms and high-traffic consumer websites, I help businesses
            turn complex ideas into intuitive, scalable software. Specializing
            in <span className="text-primary-500 font-bold">TypeScript</span>{" "}
            and modern frontend technologies like{" "}
            <span className="text-primary-500 font-bold">React</span>, I deliver
            clean, responsive interfaces that elevate user experience and drive
            results.
          </p>
        </motion.div>
      </AnimatedSection>
    </Section>
  );
}
