"use client";
import React from "react";
import Section from "../layout/section";
import Image from "next/image";
import {
  AnimatedSection,
  itemVariants,
} from "../layout/section/AnimatedSection";
import { motion } from "framer-motion";
import { LinkButton } from "../ui";

export function About() {
  return (
    <Section id="about" title="About Me">
      <AnimatedSection className="flex gap-12 flex-col lg:flex-row lg:px-2 mb-4 px-8">
        <motion.div variants={itemVariants}>
          <Image
            src="/Ben_Black-White.jpg"
            alt="Photo of Ben Wozak"
            width={500}
            height={300}
            className="rounded-2xl"
          />
        </motion.div>
        <motion.div className="max-w-xl" variants={itemVariants}>
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">
            For Industry Recruiters:
          </h3>
          <p className="md:text-lg lg:text-xl mb-8">
            Backed by years of industry experience building polished UIs for B2B
            SaaS platforms and high-traffic consumer websites, I help businesses
            turn complex ideas into intuitive, scalable software. Specializing
            in <span className="text-primary-500">TypeScript</span> and modern
            frontend frameworks like{" "}
            <span className="text-primary-500">React</span>, I deliver clean,
            responsive interfaces that elevate user experience and drive
            results.
          </p>
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">
            For Contract Roles:
          </h3>
          <p className="md:text-lg lg:text-xl">
            I build custom websites using{" "}
            <LinkButton
              href="https://nextjs.org/"
              className="md:text-lg lg:text-xl text-secondary-600 dark:text-secondary-500"
              target="_blank"
            >
              Next.js
            </LinkButton>{" "}
            and{" "}
            <LinkButton
              href="https://payloadcms.com/compare/wordpress"
              className="md:text-lg lg:text-xl text-secondary-600 dark:text-secondary-500"
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
