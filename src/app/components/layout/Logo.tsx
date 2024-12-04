"use client";
import React, { useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useSmoothScroll } from "@/app/hooks/useSmoothScroll";

type Props = {
  href: string;
};

export default function Logo({ href }: Props) {
  const scrollToElement = useSmoothScroll();
  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? "/BW_logo_light.svg" : "/BW_logo.svg";

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();

      if (href?.startsWith("#")) {
        const targetId = href.replace("#", "");
        scrollToElement(targetId);
      } else {
        // For non-hash links, use the default Link behavior
        window.location.href = href;
      }
    },
    [href, scrollToElement]
  );

  return (
    <Link className="block" href={href} onClick={handleClick}>
      <Image
        src={logoSrc}
        alt="Brand Logo"
        width={187.8}
        height={216}
        className="h-16 w-auto"
      />
    </Link>
  );
}
