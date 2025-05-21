"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSmoothScroll } from "../../utils/hooks/useSmoothScroll";

interface LinkButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  onClick?: () => void;
}

export function LinkButton({
  href,
  children,
  className = "",
  target,
  onClick,
}: LinkButtonProps) {
  const { scrollToElement } = useSmoothScroll();
  const pathname = usePathname();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (onClick) {
        onClick();
      }

      // check route for home page to activate smooth scroll
      if (href.startsWith("#") && pathname === "/") {
        e.preventDefault();
        const targetId = href.replace("#", "");
        scrollToElement(targetId);
      }
    },
    [href, onClick, scrollToElement, pathname]
  );

  return (
    <Link
      href={href}
      onClick={handleClick}
      target={target}
      className={`
        relative pb-1 tracking-wider text-sm
        after:content-[''] after:absolute after:w-full
        after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0
        after:bg-primary-500 after:origin-right
        after:transition-transform after:duration-300 after:ease-out
        hover:after:scale-x-100 hover:after:origin-left
        ${className}
      `}
    >
      {children}
    </Link>
  );
}
