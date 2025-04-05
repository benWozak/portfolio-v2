"use client";
import React, { useCallback } from "react";
import Link from "next/link";
import { useSmoothScroll } from "../../utils/hooks/useSmoothScroll";

interface CTAButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "primary" | "secondary";
}

export function CTAButton({
  href,
  children,
  className = "",
  onClick,
  type = "primary",
}: CTAButtonProps) {
  const { scrollToElement } = useSmoothScroll();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (onClick) {
        onClick();
      }

      if (href.startsWith("#")) {
        const targetId = href.replace("#", "");
        scrollToElement(targetId);
      } else {
        // For non-hash links, use the default Link behavior
        window.location.href = href;
      }
    },
    [href, onClick, scrollToElement]
  );

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
      onClick={handleClick}
      className={`
        group font-semibold
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
        hover:text-primary-foreground hover:border-primary-foreground text-md z-20 px-8 py-2 lg:px-16 lg:py-2 lg:text-lg
        "
      >
        {children}
      </span>
    </Link>
  );
}
