"use client";

import { motion } from "framer-motion";
import { TechnologyShowcase, Socials } from "../content";
import { CTAButton } from "../ui";

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

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      ease: "easeOut",
    },
  },
};

export function Hero() {
  return (
    <motion.section
      className="relative h-auto w-full flex flex-col items-center pt-28 lg:pt-32 mb-32"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="absolute h-[20%] w-[20%] top-[20%] lg:top-[30%] left-[50%] -translate-x-1/2 bg-primary-600 dark:bg-primary rounded-full blur-[110px]"></div>
      <motion.h1
        className="w-full text-3xl md:text-4xl lg:text-6xl max-w-3xl my-6 lg:mb-8 font-bold text-center leading-8"
        variants={itemVariants}
      >
        <span className="text-primary-500">Full-Stack</span> Software Developer
      </motion.h1>

      <motion.h1
        className="w-full text-xl md:text-2xl lg:text-3xl max-w-3xl font-bold text-center px-12 leading-6"
        variants={itemVariants}
      >
        Specializing in{" "}
        <span className="text-primary-500 dark:text-secondary-500">
          Frontend
        </span>{" "}
        Web Technologies
      </motion.h1>

      <motion.div className="mt-16 lg:mt-10" variants={itemVariants}>
        <CTAButton href="#contact">Get in Touch</CTAButton>
      </motion.div>

      <motion.div className="mt-4 mb-12 lg:mt-6" variants={itemVariants}>
        <Socials size="lg" />
      </motion.div>

      <motion.div
        className="flex flex-wrap gap-5 md:flex md:flex-row items-center justify-center lg:h-24 h-auto w-[80%] lg:mx-auto mx-2"
        variants={itemVariants}
      >
        <TechnologyShowcase />
      </motion.div>
    </motion.section>
  );
}
