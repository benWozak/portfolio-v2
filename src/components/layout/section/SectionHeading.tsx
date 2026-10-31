"use client";
import React from "react";
import { AnimatedSection, itemVariants } from "./AnimatedSection";
import { motion } from "framer-motion";

interface SectionHeadingProps {
  title: string;
  /** `h2` inside page sections (default); `h1` when the heading titles the page. */
  as?: "h1" | "h2";
}

export function SectionHeading({ title, as = "h2" }: SectionHeadingProps) {
  const Tag = as;
  return (
    <AnimatedSection>
      <motion.div
        className="relative mb-8 flex gap-4 items-center"
        variants={itemVariants}
      >
        <div className="w-8 lg:w-16 h-0.5 lg:h-1 rounded-full bg-primary"></div>
        <Tag className="inline-block text-2xl font-bold py-2 lg:px-4 uppercase tracking-wider">
          {title}
        </Tag>
      </motion.div>
    </AnimatedSection>
  );
}
