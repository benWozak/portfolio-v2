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
  const { scrollToTop } = useSmoothScroll();
  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? "/BW_logo_light.svg" : "/BW_logo.svg";

  return (
    <span className="block hover:cursor-pointer" onClick={scrollToTop}>
      <Image
        src={logoSrc}
        alt="Brand Logo"
        width={187.8}
        height={216}
        className="h-16 w-auto"
      />
    </span>
  );
}
