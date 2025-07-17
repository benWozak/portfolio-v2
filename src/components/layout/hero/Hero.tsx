"use client";

import React from "react";
import { motion } from "framer-motion";
import { CTAButton } from "../../ui";
import { itemVariants } from "../section/AnimatedSection";
import { TechOrbit } from "./TechOrbit";

// type Props = Record<string, never>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 1,
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export function Hero() {
  const items: string[] = [
    "Custom Websites",
    "Product Stores",
    "Online Services",
    "Custom Solutions",
  ];

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative h-auto w-full flex flex-col px-4 mb-16 mx-auto mt-36 lg:my-32 lg:h-[32rem] lg:flex-row lg:items-center"
    >
      <div className="w-full">
        <motion.h1
          variants={itemVariants}
          className="text-3xl font-bold tracking-wide text-gray-800 dark:text-white md:text-4xl lg:text-6xl"
        >
          <span className="text-primary-500">Your Vision</span>
          <br />
          Expertly Developed
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="my-8 font-semibold text-lg lg:text-2xl text-gray-600 dark:text-gray-300"
        >
          From concept to completion - Transforming innovative ideas into
          impactful{" "}
          <span className="text-primary-500">digital experiences.</span>
        </motion.p>

        <motion.div
          className="mb-6 lg:my-10 flex gap-4"
          variants={itemVariants}
        >
          <CTAButton href="/contact">Get in Touch</CTAButton>
          <CTAButton type="secondary" href="#about">
            Learn More
          </CTAButton>
        </motion.div>
      </div>

      <motion.div
        variants={itemVariants}
        className="flex items-center justify-center w-full h-96 lg:w-2/3"
      >
        <TechOrbit />
      </motion.div>
    </motion.section>
  );
}
