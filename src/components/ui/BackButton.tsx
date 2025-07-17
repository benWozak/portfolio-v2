"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  return (
    <button
      onClick={handleBackClick}
      className="group inline-flex items-center mb-8 relative overflow-hidden px-4 py-2 rounded hover:text-primary-500 dark:hover:text-secondary-400 transition-colors duration-300 border border-transparent hover:border-primary-500 dark:hover:border-secondary-400"
    >
      <span className="inline-block hover:animate-bounce-horizontal mr-2 transition-transform duration-300 group-hover:-translate-x-1">
        ←
      </span>
      <span className="relative z-10 transition-colors duration-300">Back</span>
    </button>
  );
}
