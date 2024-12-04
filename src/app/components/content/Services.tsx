import React from "react";
import Section from "../layout/section";

export function Services() {
  return (
    <Section id="services" title="Services">
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
    </Section>
  );
}
