"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { GROUP_ORDER, PROJECT_GROUPS } from "./groups";

export function ProjectTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Project groups" className="mb-8 border-b border-gray-200 pt-16 dark:border-gray-700">
      <ul role="list" className="-mb-px flex gap-6">
        {GROUP_ORDER.map((type) => {
          const group = PROJECT_GROUPS[type];
          const active = pathname === group.href;
          return (
            <li key={type}>
              <Link
                href={group.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-ring inline-block border-b-2 px-1 pb-3 text-sm font-medium tracking-wider transition-colors",
                  active
                    ? cn("text-foreground", group.accentBorder)
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-foreground dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-foreground",
                )}
              >
                {group.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
