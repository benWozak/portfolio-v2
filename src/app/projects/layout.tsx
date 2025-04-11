"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SectionHeading } from "@/components/layout/section/SectionHeading";
import clsx from "clsx";
import { LinkButton } from "@/components/ui";

const tabs = [
  { name: "All Projects", href: "/projects" },
  { name: "Web Projects", href: "/projects/web" },
  { name: "Native Projects", href: "/projects/native" },
];

function getTitle(pathname: string): string {
  if (pathname === "/projects/web") return "Web Projects";
  if (pathname === "/projects/native") return "Native Projects";
  return "All Projects";
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentTitle = getTitle(pathname);

  return (
    <article className="container mx-auto my-16 px-4 py-16 lg:py-8">
      <nav className="mb-8 flex space-x-4">
        {tabs.map((tab) => (
          <LinkButton
            key={tab.name}
            href={tab.href}
            className={clsx(
              "pb-2 px-4 text-sm font-medium",
              pathname === tab.href
                ? "border-b-2 border-primary-500 text-primary-500"
                : ""
            )}
          >
            {tab.name}
          </LinkButton>
        ))}
      </nav>
      <SectionHeading title={currentTitle} />
      {children}
    </article>
  );
}
