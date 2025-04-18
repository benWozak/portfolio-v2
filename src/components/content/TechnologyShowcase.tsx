"use client";
import { WebTechnology } from "../ui/WebTechnology";
import {
  SiNextdotjs,
  SiReact,
  SiTypescript,
  SiTailwindcss,
  SiNodedotjs,
  SiPostgresql,
  SiVuedotjs,
  SiSass,
  SiLaravel,
  SiPython,
  SiGraphql,
  SiDocker,
  SiSqlite,
} from "react-icons/si";
import Section from "../layout/section";
import {
  AnimatedSection,
  itemVariants,
} from "../layout/section/AnimatedSection";

import { FaAws } from "react-icons/fa";
import { motion } from "framer-motion";

export function TechnologyShowcase() {
  const primaryStack = [
    {
      name: "Tailwind",
      icon: <SiTailwindcss className="w-6 h-6 lg:w-10 lg:h-10" />,
    },
    {
      name: "TypeScript",
      icon: <SiTypescript className="w-6 h-6 lg:w-10 lg:h-10" />,
    },
    { name: "React", icon: <SiReact className="w-6 h-6 lg:w-10 lg:h-10" /> },
    {
      name: "Next.js",
      icon: <SiNextdotjs className="w-6 h-6 lg:w-10 lg:h-10" />,
    },
    {
      name: "Postgres",
      icon: <SiPostgresql className="w-6 h-6 lg:w-10 lg:h-10" />,
    },
  ];
  const secondaryStack = [
    { name: "Vue", icon: <SiVuedotjs className="w-6 h-6 lg:w-10 lg:h-10" /> },
    { name: "Sass", icon: <SiSass className="w-6 h-6 lg:w-10 lg:h-10" /> },
    {
      name: "Node.js",
      icon: <SiNodedotjs className="w-6 h-6 lg:w-10 lg:h-10" />,
    },
    {
      name: "Laravel",
      icon: <SiLaravel className="w-6 h-6 lg:w-10 lg:h-10" />,
    },
    { name: "Python", icon: <SiPython className="w-6 h-6 lg:w-10 lg:h-10" /> },
    {
      name: "GraphQL",
      icon: <SiGraphql className="w-6 h-6 lg:w-10 lg:h-10" />,
    },
    { name: "Sqlite", icon: <SiSqlite className="w-6 h-6 lg:w-10 lg:h-10" /> },
    { name: "AWS", icon: <FaAws className="w-6 h-6 lg:w-10 lg:h-10" /> },
    { name: "Docker", icon: <SiDocker className="w-6 h-6 lg:w-10 lg:h-10" /> },
  ];

  return (
    <Section id="tech" title="Technology Stack">
      <AnimatedSection className="flex flex-col items-center justify-center gap-4 lg:gap-8 px-4 lg:px-0">
        {/* <div className="flex items-center justify-center gap-4 lg:gap-6 uppercase text-sm lg:text-md font-semibold mb-4">
          <div className="w-16 lg:w-24 h-0.5 lg:h-1 rounded-full bg-primary"></div>
          Main Stack
          <div className="w-16 lg:w-24 h-0.5 lg:h-1 rounded-full bg-primary"></div>
        </div> */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap gap-2 lg:gap-4 justify-center max-w-3xl"
        >
          {primaryStack.map((tech, index) => (
            <WebTechnology key={index} name={tech.name} icon={tech.icon} />
          ))}
        </motion.div>

        <div className="flex items-center justify-center uppercase text-sm lg:text-md font-semibold my-4">
          <div className="w-24 lg:w-64 h-0.5 lg:h-[2px] rounded-full bg-primary"></div>

          {/* <div className="w-16 lg:w-24 h-0.5 lg:h-1 rounded-full bg-primary"></div> */}
        </div>
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap gap-2 lg:gap-4 justify-center max-w-3xl"
        >
          {secondaryStack.map((tech, index) => (
            <WebTechnology key={index} name={tech.name} icon={tech.icon} />
          ))}
        </motion.div>
      </AnimatedSection>
    </Section>
  );
}
