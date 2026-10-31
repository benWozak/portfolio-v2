"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useSmoothScroll } from "@/utils/hooks/useSmoothScroll";

export default function Logo() {
  const { scrollToTop } = useSmoothScroll();
  // resolvedTheme already accounts for the system preference; it is
  // undefined until mounted, which matches the server-rendered default logo.
  const { resolvedTheme } = useTheme();
  const logoSrc =
    resolvedTheme === "dark" ? "/BW_logo_light.svg" : "/BW_logo.svg";
  const pathname = usePathname();

  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      scrollToTop();
    }
  };

  return (
    <Link
      href="/"
      className="block hover:cursor-pointer"
      onClick={handleLogoClick}
    >
      <Image
        src={logoSrc}
        alt="Brand Logo"
        width={187.8}
        height={216}
        className="h-16 w-auto"
        priority
      />
    </Link>
  );
}
