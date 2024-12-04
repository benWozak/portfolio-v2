import React from "react";
import Section from "../layout/section";

export function Projects() {
  return (
    <Section
      id="projects"
      title="Projects"
      className="flex items-center flex-1"
    >
      <div className="flex flex-col w-max">
        <h1 className="text-5xl font-extrabold text-center lg:text-7xl 2xl:text-8xl">
          <span className="text-transparent bg-gradient-to-br bg-clip-text from-secondary-300 via-secondary-500 to-secondary-700 dark:from-secondary-200 dark:via-secondary-800 dark:to-secondary-300">
            Coming{" "}
          </span>

          <span className="text-transparent bg-gradient-to-tr bg-clip-text from-secondary-500 via-primary-300 to-primary-700 dark:from-secondary-300 dark:via-primary-300 dark:to-primary-500">
            Soon
          </span>
        </h1>
      </div>
    </Section>
  );
}
