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

export function LinkButton({
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
        relative pb-2 tracking-wider text-sm
        after:content-[''] after:absolute after:w-full
        after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0
        after:bg-primary after:origin-right
        after:transition-transform after:duration-300 after:ease-out
        hover:after:scale-x-100 hover:after:origin-left
        ${className}
      `}
    >
      {children}
    </Link>
  );
}
