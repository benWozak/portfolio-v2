"use client";
import React from "react";
import Section from "../layout/section";
import {
  AnimatedSection,
  itemVariants,
} from "../layout/section/AnimatedSection";
import { motion } from "framer-motion";

type ServiceItemProps = {
  title: string;
  description: string;
};

const serviceItems: ServiceItemProps[] = [
  {
    title: "Custom Website",
    description:
      "Modern, responsive websites built with Next.js—tailored to your brand, goals, and business needs. Every project is crafted with performance, usability, and visual polish in mind.",
  },
  {
    title: "E-commerce Solutions",
    description:
      "Fully featured online stores with custom design, secure payment processing, inventory management, and a frictionless shopping experience that scales with your business.",
  },
  {
    title: "Flexible Content Management",
    description:
      "Empower your team with Payload CMS—an intuitive, headless content management system that gives you complete control over your content without needing a developer.",
  },
  {
    title: "Affordability",
    description:
      "High-quality results at competitive rates, with flexible payment options that respect your budget and the unique scope of your project.",
  },
  {
    title: "Professional Support",
    description:
      "Ongoing & reliable technical assistance, timely maintenance, and expert advice whenever you need it for your digital properties.",
  },
  {
    title: "Flexible Hosting Options",
    description:
      "Scalable hosting solutions that grow with your business, from shared environments to dedicated infrastructure with managed services.",
  },
];

const ServiceItem = ({ title, description }: ServiceItemProps) => (
  <div className="flex">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
      className="flex-shrink-0 w-6 h-6 text-secondary-700 dark:text-secondary-500"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M5 13l4 4L19 7"
      ></path>
    </svg>
    <div className="ml-3">
      <dt className="text-lg font-medium text-secondary-700 dark:text-secondary-500">
        {title}
      </dt>
      <dd className="mt-2">{description}</dd>
    </div>
  </div>
);

export function Services() {
  return (
    <Section id="services" title="Freelance Services">
      <AnimatedSection>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <dl className="px-4 mt-12 space-y-10 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-8">
            {serviceItems.map((service, index) => (
              <motion.div key={index} variants={itemVariants}>
                <ServiceItem
                  title={service.title}
                  description={service.description}
                />
              </motion.div>
            ))}
          </dl>
        </div>
      </AnimatedSection>
    </Section>
  );
}
