import React from "react";

interface WebTechnologyProps {
  name: string;
  icon: React.ReactNode;
}

export function WebTechnology({ name, icon }: WebTechnologyProps) {
  return (
    <div className="flex items-center space-x-2 p-2 bg-secondary-bg rounded-md shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="w-6 h-6">{icon}</div>
      <span className="text-sm font-medium">{name}</span>
    </div>
  );
}
