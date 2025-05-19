"use client";

import React from "react";
import { motion } from "framer-motion";
import { CTAButton } from "../ui";
import { itemVariants } from "./section/AnimatedSection";
import { OrbitingCircles } from "../magicui/orbiting-circles";
import { File, Settings, Search } from "lucide-react";

type Props = {};

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

export function HeroFreelance({}: Props) {
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
      className="relative h-auto w-full flex flex-col px-4 mb-16 mx-auto my-32 lg:h-[32rem] lg:flex-row lg:items-center"
    >
      <div className="w-full lg:max-w-3xl">
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
          className="mt-4 font-semibold text-lg lg:text-2xl text-gray-600 dark:text-gray-300"
        >
          From concept to completion - Transforming innovative ideas into
          impactful{" "}
          <span className="text-primary-500">digital experiences.</span>
        </motion.p>
        <div className="grid gap-2 mt-8 sm:grid-cols-2">
          {items.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="flex items-center lg:text-lg text-gray-800 -px-3 dark:text-gray-200"
            >
              <svg
                className="w-5 h-5 mx-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>

              <span className="mx-3">{item}</span>
            </motion.div>
          ))}
        </div>
        <motion.div
          className="my-6 lg:my-10 flex gap-4"
          variants={itemVariants}
        >
          <CTAButton href="/contact">Get in Touch</CTAButton>
          <CTAButton type="secondary" href="/about">
            Learn More
          </CTAButton>
        </motion.div>
      </div>

      <motion.div
        variants={itemVariants}
        className="flex items-center justify-center w-full h-96 lg:w-1/2"
      >
        {/* <img
          className="object-cover w-full h-full max-w-2xl rounded-md invert dark:invert-0"
          src="/hero-bg.svg"
          alt="glasses photo"
        /> */}
        <div className="relative overflow-hidden h-[500px] w-full">
          <OrbitingCircles>
            <File />
            <Settings />
            <File />
          </OrbitingCircles>
          <OrbitingCircles radius={100} reverse>
            <File />
            <Settings />
            <File />
            <Search />
          </OrbitingCircles>
        </div>
      </motion.div>
    </motion.section>
  );
}
