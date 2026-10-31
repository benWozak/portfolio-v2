import React from "react";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";

type Props = {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
};

export default function Section({ id, title, children, className }: Props) {
  return (
    <section id={id} className={cn("w-full max-w-4xl mb-16 pt-16", className)}>
      <SectionHeading title={title} />
      {children}
    </section>
  );
}
