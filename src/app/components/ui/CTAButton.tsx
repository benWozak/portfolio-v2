"use client";
import React, { useCallback } from "react";
import Link from "next/link";
import { useSmoothScroll } from "../../hooks/useSmoothScroll";

interface CTAButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function CTAButton({
  href,
  children,
  className = "",
  onClick,
}: CTAButtonProps) {
  const scrollToElement = useSmoothScroll();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (onClick) {
        onClick();
      }

      if (href.startsWith("#")) {
        // const targetId = href.replace("#", "");
        scrollToElement("#");
      } else {
        // For non-hash links, use the default Link behavior
        window.location.href = href;
      }
    },
    [href, onClick, scrollToElement]
  );

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`
        bg-primary text-primary-foreground
        group font-semibold
        relative flex justify-center items-center rounded-md
        overflow-hidden cursor-pointer border-none
        after:content-["_"] after:absolute after:h-full
        after:bg-secondary-700 after:w-0 after:right-0
        after:transition-all after:duration-300 after:ease-in-out
        after:z-10
        hover:after:right-auto hover:after:left-0 hover:after:w-full
        ${className}
      `}
    >
      <span
        className="
        relative w-full text-center text-primary-foreground transition-all duration-300 
        hover:text-primary-foreground text-md z-20 px-12 py-2 lg:px-16 lg:py-3 lg:text-lg
        "
      >
        {children}
      </span>
    </Link>
  );
}
