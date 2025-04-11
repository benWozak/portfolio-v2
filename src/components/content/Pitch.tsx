"use client";
import React from "react";
import Section from "../layout/section";
import {
  AnimatedSection,
  itemVariants,
} from "../layout/section/AnimatedSection";
import { motion } from "framer-motion";
import { Rocket, Cpu, Blocks, UserIcon } from "lucide-react";

type Props = {};

export function Pitch({}: Props) {
  const features = [
    {
      title: "Startup-Proven Engineer",
      description:
        "Seasoned in fast-moving startup environments with a passion for building efficient, scalable solutions. I bring a wealth of experience to every project.",
      icon: Rocket,
    },
    {
      title: "Tech Stack Fluent",
      description:
        "Comfortable across the stack — especially sharp in frontend ecosystems. I have the tools and intuition to bring any feature to life.",
      icon: Cpu,
    },
    {
      title: "Systems Thinker",
      description:
        "I think in systems — designing intuitive interfaces while accounting for backend architecture, performance, and scalability.",
      icon: Blocks,
    },
    {
      title: "Client-Centered Developer",
      description:
        "I listen first, code second — ensuring every line I write aligns with your goals and gives you full control over features and content.",
      icon: UserIcon,
    },
  ];

  return (
    <Section id="services" title="Value Proposition">
      <AnimatedSection className="px-4">
        <motion.div
          className="text-sm md:text-base lg:text-xl lg:px-2 mb-8 max-w-3xl text-gray-800 dark:text-gray-200"
          variants={itemVariants}
        >
          Currently available for freelance projects — I partner with
          individuals and small teams to ship thoughtful, effective software
          quickly and affordably.
          <br />
          <br />
          Here’s what I bring to every engagement:
        </motion.div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-2">
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <feature.icon className="text-primary-500 w-6 h-6" />

              <h1 className="mt-4 text-base md:text-lg lg:text-2xl font-semibold text-secondary-700 dark:text-secondary-500">
                {feature.title}
              </h1>

              <p className="mt-2 text-sm md:text-base lg:text-lg">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>
    </Section>
  );
}
