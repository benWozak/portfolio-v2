"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LinkButtonProps {
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
}: LinkButtonProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    }
    // Use a small delay to ensure the onClick function (like closing the menu) completes first
    setTimeout(() => {
      router.push(href);
    }, 10);
  };
  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`
        px-8 py-4 bg-primary text-primary-foreground
        group font-semibold
        relative flex justify-center items-center rounded-md
        overflow-hidden cursor-pointer border-none
        after:content-["_"] after:absolute after:h-full
        after:bg-secondary-700 after:w-0 after:right-0
        after:transition-all after:duration-300 after:ease-in-out
        after:z-10
        hover:after:right-auto hover:after:left-0 hover:after:w-full
        [&>a]:relative
        [&>a]:w-full
        [&>a]:text-center [&>a]:no-underline
        [&>a]:px-6 [&>a]:py-4
        [&>a]:text-foreground [&>a]:text-lg
        [&>a]:transition-all [&>a]:duration-300
        hover:[&>a]:text-foreground
        ${className}
      `}
    >
      <span className="z-20">{children}</span>
    </Link>
  );
}
