"use client";

import React from "react";
import Section from "../layout/section";
import {
  AnimatedSection,
  itemVariants,
} from "../layout/section/AnimatedSection";
import { motion } from "framer-motion";
import { CTAButton } from "../ui";

interface TimeBlockProps {
  time: string;
  company: string;
  role: string;
  url?: string;
  description: string;
}

const experiences: TimeBlockProps[] = [
  {
    time: "January, 2025 - Present",
    company: "Cognitive3D",
    role: "Software Engineer",
    url: "https://cognitive3d.com",
    description:
      "A SaaS startup that provides spatial analytics for VR/AR/XR through SDK integrations, enabling businesses to visualize user behavior in immersive environments and make data-driven design decisions.",
  },
  {
    time: "Nov, 2023 - July, 2024",
    company: "Flipp Advertising",
    role: "Senior Web Developer",
    url: "https://flippadvertising.com/",
    description:
      "A digital design agency that offers marketing strategies, brand identity and digital solutions.",
  },
  {
    time: "Sep, 2019 - Nov, 2023",
    company: "chata.ai",
    role: "Team Lead/Frontend Software Engineer",
    url: "https://chata.ai",
    description:
      "A SaaS startup that leverages natural language processing to translate conversational language into precise, executable database queries, trivializing powerful data retrieval for non-technical users.",
  },
  {
    time: "April, 2019 - Dec, 2019",
    company: "KRD Consulting",
    role: "Frontend Developer",
    url: "https://hellokrd.net/",
    description:
      "A specialized consulting firm that provides strategic guidance, operational support, and fundraising expertise to help non-profit organizations optimize their impact, efficiency, and mission-driven goals.",
  },
];

function TimeBlock({ time, company, role, url, description }: TimeBlockProps) {
  return (
    <motion.li className="mb-8 ms-8 lg:mb-20 lg:ms-12" variants={itemVariants}>
      <div className="absolute w-3 h-3 bg-secondary-700 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-secondary-500"></div>
      <time className="mb-1 text-sm lg:text-base font-normal leading-none text-secondary-800 dark:text-secondary-500">
        {time}
      </time>
      <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">
        <span className="text-primary dark:text-primary-500">{role}</span>{" "}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-secondary-500"
        >
          {"@"}
          {company}
        </a>
      </h3>

      <p className="mb-4 text-sm lg:text-base font-normal text-gray-600 dark:text-gray-200">
        {description}
      </p>
    </motion.li>
  );
}

export function Experience() {
  return (
    <Section id="experience" title="Professional Experience">
      <AnimatedSection className="relative border-s border-primary-500 dark:border-primary-500 py-10 mx-8 lg:mx-0">
        {experiences.map((exp, index) => (
          <motion.ol key={index} variants={itemVariants}>
            <TimeBlock {...exp} />
          </motion.ol>
        ))}
        <motion.div
          variants={itemVariants}
          className="mt-8 lg:mt-12 flex justify-center"
        >
          <CTAButton type="secondary" href="/resume" className="w-72">
            View My CV
          </CTAButton>
        </motion.div>
      </AnimatedSection>
    </Section>
  );
}
