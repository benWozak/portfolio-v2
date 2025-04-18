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
    title: "Custom Websites",
    description:
      "Modern, responsive websites built with Next.js that are tailored to your brand, goals, and business needs. Designed for performance, usability, and visual polish.",
  },
  {
    title: "E-commerce Solutions",
    description:
      "Custom online stores with secure payments, inventory management, and seamless shopping experiences that scale with your business.",
  },
  {
    title: "Content Management",
    description:
      "Empower your team with Payload CMS; an intuitive, feature rich and developer-friendly system that gives you full control over your content without extra overhead you might see with other solutions.",
  },
  {
    title: "Flexible Pricing",
    description:
      "High-quality results at competitive rates, with payment structures that respect your budget and the unique needs of your project.",
  },
  {
    title: "Ongoing Support",
    description:
      "Reliable maintenance, technical assistance, and expert guidance that is available when you need it, for the long run.",
  },
  {
    title: "Scalable Hosting",
    description:
      "Hosting options that grow with your business, from shared environments to fully managed and dedicated infrastructure.",
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
