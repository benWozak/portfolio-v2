import React from "react";
import { SectionHeading } from "./SectionHeading";

type Props = {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
};

export default function Section({ id, title, children }: Props) {
  return (
    <section id={id} className="w-full max-w-4xl mb-16 pt-16">
      <SectionHeading title={title} />
      {children}
    </section>
  );
}
