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
          <p className="text-sm md:text-base lg:text-xl mb-4">
            Backed by years of industry experience building polished UIs for B2B
            SaaS platforms and high-traffic consumer websites, I help businesses
            turn complex ideas into intuitive, scalable software. Specializing
            in JavaScript and modern frontend frameworks, I deliver clean,
            responsive interfaces that elevate user experience and drive
            results.
          </p>
          <p className="text-sm md:text-base lg:text-xl">
            I build custom websites using{" "}
            <LinkButton
              href="https://nextjs.org/"
              className="text-sm md:text-base lg:text-xl text-secondary-600 dark:text-secondary-500"
              target="_blank"
            >
              Next.js
            </LinkButton>{" "}
            and{" "}
            <LinkButton
              href="https://payloadcms.com/compare/wordpressk"
              className="text-sm md:text-base lg:text-xl text-secondary-600 dark:text-secondary-500"
              target="_blank"
            >
              Payload CMS
            </LinkButton>
            —a modern, headless CMS that outperforms traditional platforms like
            WordPress in flexibility and performance. This stack gives
            businesses full control over their content, supports advanced
            features out of the box, and scales effortlessly; whether you need a
            marketing site, a blog, an online store, or something entirely
            custom.
          </p>
        </motion.div>
      </AnimatedSection>
    </Section>
  );
}

// https://payloadcms.com/
// https://payloadcms.com/compare/wordpress
// https://nextjs.org/
