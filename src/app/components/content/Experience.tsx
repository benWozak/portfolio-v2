import React from "react";
import Section from "../layout/section";

export function Experience() {
  function renderTimeBlock(
    time: string,
    company: string,
    role: string,
    description: string
  ) {
    return (
      <li className="mb-20 ms-12">
        <div className="absolute w-3 h-3 bg-secondary-700 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-secondary-500"></div>
        <time className="mb-1 text-sm font-normal leading-none text-secondary-800 dark:text-secondary-500/70">
          {time}
        </time>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          <span className="text-primary dark:text-secondary-500">{role}</span>{" "}
          {"@"}
          {company}
        </h3>
        <p className="mb-4 text-base font-normal text-gray-600 dark:text-gray-300">
          {description}
        </p>
      </li>
    );
  }
  return (
    <Section id="experience" title="Experience">
      <ol className="relative border-s border-primary-500 dark:border-primary-500 py-10">
        {renderTimeBlock(
          "Nov, 2023 - July, 2024",
          "Flipp Advertising",
          "Senior Web Developer",
          "A digital design agency that offers marketing strategies, brand identity and digital solutions."
        )}
        {renderTimeBlock(
          "Sep, 2019 - Nov, 2023",
          "chata.ai",
          "Team Lead/Frontend Software Engineer",
          "A SaaS startup that leverages natural language processing to translate conversational language into precise, executable database queries, trivializing powerful data retrieval for non-technical users."
        )}
        {renderTimeBlock(
          "April, 2019 - Dec, 2019",
          "KRD Consulting",
          "Frontend Developer",
          "A specialized consulting firm that provides strategic guidance, operational support, and fundraising expertise to help non-profit organizations optimize their impact, efficiency, and mission-driven goals."
        )}
      </ol>
    </Section>
  );
}
