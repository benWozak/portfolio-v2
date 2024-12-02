import React from "react";
import { SectionHeading } from "../layout/SectionHeading";

type Props = {};

export function Projects({}: Props) {
  return (
    <section id="projects" className="max-w-4xl mb-16">
      <SectionHeading title="Projects" />
      <section className="flex items-center flex-1">
        <div className="flex flex-col w-max">
          <h1 className="text-5xl font-extrabold text-center lg:text-7xl 2xl:text-8xl">
            <span className="text-transparent bg-gradient-to-br bg-clip-text from-teal-500 via-indigo-500 to-sky-500 dark:from-teal-200 dark:via-indigo-300 dark:to-sky-500">
              Coming
            </span>

            <span className="text-transparent bg-gradient-to-tr bg-clip-text from-secondary via-primary-200 to-primary-500 dark:from-sky-300 dark:via-primary-300 dark:to-primary-500">
              Soon
            </span>
          </h1>
        </div>
      </section>
    </section>
  );
}
