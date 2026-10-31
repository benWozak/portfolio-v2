import React from "react";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types";

type BadgeProps = {
  status?: ProjectStatus | string;
  className?: string;
};

const STATUS_CLASSES: Record<ProjectStatus, string> = {
  Live: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200",
  "In Progress": "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200",
  Prototype: "bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-200",
  Archived: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
};
const DEFAULT_CLASSES = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";

function isKnownStatus(value: string): value is ProjectStatus {
  // hasOwnProperty, not `in`: "constructor" and friends must not match prototype keys
  return Object.prototype.hasOwnProperty.call(STATUS_CLASSES, value);
}

export function Badge({ status, className }: BadgeProps) {
  const label = status === undefined || status === null ? "" : String(status);
  const colour = isKnownStatus(label) ? STATUS_CLASSES[label] : DEFAULT_CLASSES;
  return (
    <span className={cn("inline-block rounded-full px-2 py-1 text-xs font-medium", colour, className)}>
      {label}
    </span>
  );
}
