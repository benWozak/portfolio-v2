import React from "react";
import Section from "../layout/section";

type Props = {};

export function Experience({}: Props) {
  return (
    <Section id="experience" title="Experience">
      <ol className="relative border-s border-gray-200 dark:border-gray-700">
        <li className="mb-10 ms-4">
          <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
          <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
            Nov, 2023
          </time>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Flipp Advertising
          </h3>
          <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
            A digital design agency that offers marketing strategies, brand
            identity and digital solutions.
          </p>
        </li>
        <li className="mb-10 ms-4">
          <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
          <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
            Sep, 2019
          </time>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            chata.ai
          </h3>
          <p className="text-base font-normal text-gray-500 dark:text-gray-400">
            A SaaS startup that leverages natural language processing to
            translate conversational language into precise, executable database
            queries, trivializing powerful data retrieval for non-technical
            users.
          </p>
        </li>
        <li className="ms-4">
          <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
          <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
            May, 2018
          </time>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            KRD Consulting
          </h3>
          <p className="text-base font-normal text-gray-500 dark:text-gray-400">
            A specialized consulting firm that provides strategic guidance,
            operational support, and fundraising expertise to help non-profit
            organizations optimize their impact, efficiency, and mission-driven
            goals.
          </p>
        </li>
      </ol>
    </Section>
  );
}
