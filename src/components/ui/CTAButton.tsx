import React from "react";
import Link from "next/link";

interface CTAButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  type?: "primary" | "secondary";
  /** Open in a new tab with rel="noopener noreferrer" and an sr-only hint. */
  external?: boolean;
}

export function CTAButton({
  href,
  children,
  className = "",
  type = "primary",
  external = false,
}: CTAButtonProps) {
  const buttonStyles =
    type === "primary"
      ? `
      bg-primary text-primary-foreground
      after:bg-secondary-700
    `
      : `
      bg-transparent border border-neutral-800 text-neutral-800
      dark:border-neutral-200 dark:text-neutral-200
      after:bg-secondary-700
      transition-colors duration-300
      hover:border-transparent
    `;

  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`
        group font-semibold focus-ring
        relative flex justify-center items-center rounded-md
        overflow-hidden cursor-pointer
        after:content-["_"] after:absolute after:h-full
        after:w-0 after:right-0
        after:transition-all after:duration-300 after:ease-in-out
        after:z-10
        hover:after:right-auto hover:after:left-0 hover:after:w-full
        ${buttonStyles}
        ${className}
      `}
    >
      <span
        className="
        relative w-full text-center transition-all duration-300
        hover:text-primary-foreground z-20 px-8 py-2 lg:px-16 lg:text-lg
        "
      >
        {children}
        {external && <span className="sr-only"> (opens in a new tab)</span>}
      </span>
    </Link>
  );
}
