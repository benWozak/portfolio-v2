"use client";
import React from "react";
import Section from "../layout/section";
// import Image from "next/image";
import {
  AnimatedSection,
  itemVariants,
} from "../layout/section/AnimatedSection";
import { motion } from "framer-motion";
import { LinkButton } from "../ui";
import { Globe } from "../magicui/globe";

export function About() {
  return (
    <Section id="about" title="About Me">
      <AnimatedSection className="flex gap-12 flex-col lg:flex-row mb-4 px-4 lg:px-2">
        <motion.div variants={itemVariants}>
          {/* <Image
            src="/Ben_Black-White.jpg"
            alt="Photo of Ben Wozak"
            width={500}
            height={300}
            className="rounded-2xl"
          /> */}
          <div className="relative flex size-full max-w-lg items-center justify-center overflow-hidden px-40 py-44 md:pt-8 md:pb-60">
            <Globe className="top-0 md:top-28 dark:invert" />
          </div>
        </motion.div>
        <motion.div className="max-w-xl" variants={itemVariants}>
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">
            For Industry Recruiters:
          </h3>
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
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">
            For Contract Roles:
          </h3>
          <p className="lg:text-lg">
            I build custom websites and applications using{" "}
            <LinkButton
              href="https://nextjs.org/"
              className="lg:text-lg text-secondary-600 dark:text-secondary-500 font-bold"
              target="_blank"
            >
              Next.js
            </LinkButton>{" "}
            and{" "}
            <LinkButton
              href="https://payloadcms.com/compare/wordpress"
              className="lg:text-lg text-secondary-600 dark:text-secondary-500 font-bold"
              target="_blank"
            >
              Payload CMS
            </LinkButton>{" "}
            — a modern, headless CMS that outperforms traditional platforms like
            WordPress in flexibility, performance and security. This stack
            allows me to give clients full control over their content, supports
            advanced features out of the box, and scales effortlessly; whether
            you need a marketing site, a blog, an online store, or something
            entirely custom.
          </p>
        </motion.div>
      </AnimatedSection>
    </Section>
  );
}
