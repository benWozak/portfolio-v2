import React from "react";
import { ProjectStatus, ProjectType } from "@/types";

type BadgeProps = {
  status?: ProjectStatus | ProjectType | string;
  className?: string;
};

export function Badge({ status, className }: BadgeProps) {
  const getColorClass = () => {
    switch (status) {
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Prototype":
        return "bg-blue-100 text-blue-800";
      case "Professional":
        return "bg-green-100 text-green-800";
      case "web":
        return "bg-primary-500 text-primary-foreground";
      case "native":
        return "bg-secondary-700 text-primary-foreground";
      case "Featured":
        return "bg-primary-500 text-primary-foreground";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${getColorClass()} ${
        className ? className : ""
      }`}
    >
      {status}
    </span>
  );
}
