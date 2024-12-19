import React from "react";

interface WebTechnologyProps {
  name: string;
  icon: React.ReactNode;
}

export function WebTechnology({ name, icon }: WebTechnologyProps) {
  return (
    <div
      className={`flex items-center space-x-2 p-2 bg-secondary-bg rounded-md text-secondary-700 
        hover:cursor-default hover:text-secondary-900 dark:text-secondary-500 hover:dark:text-secondary-300 
        shadow-sm hover:shadow-md hover:shadow-slate-300 hover:dark:shadow-slate-500 transition-all 
        duration-300`}
    >
      <div className="w-6 h-6">{icon}</div>
      <span className="text-sm font-medium">{name}</span>
    </div>
  );
}
