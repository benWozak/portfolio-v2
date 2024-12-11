import React from "react";
import { ProjectStatus } from "@/types";

type BadgeProps = {
  status: ProjectStatus;
};

export function Badge({ status }: BadgeProps) {
  const getColorClass = () => {
    switch (status) {
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Prototype":
        return "bg-blue-100 text-blue-800";
      case "Complete":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${getColorClass()}`}
    >
      {status}
    </span>
  );
}
