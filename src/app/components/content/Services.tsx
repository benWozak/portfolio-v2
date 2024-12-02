import React from "react";
import { SectionHeading } from "../layout/SectionHeading";

type Props = {};

export function Services({}: Props) {
  return (
    <section id="services" className="max-w-4xl mb-16">
      <SectionHeading title="Services" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center p-6 bg-secondary-bg rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2 text-primary">
            Website Development
          </h2>
          <p>
            Complete your vision with an expertly crafted UI fully complimented
            by the most powerful modern technology, delivering lightning-fast
            performance across all platforms.
          </p>
        </div>
        <div className="text-center p-6 bg-secondary-bg rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2 text-primary">
            Content Management
          </h2>
          <p>
            Experience the highest level of customization with a fully featured
            with previews and version control in a user interface designed for
            efficiency and ease of use.
          </p>
        </div>
        <div className="text-center p-6 bg-secondary-bg rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2 text-primary">
            Custom Web Solutions
          </h2>
          <p>
            Enhance your digital platform with specialized features - from
            membership portals and booking systems to third-party API
            integrations.
          </p>
        </div>
      </div>
    </section>
  );
}
