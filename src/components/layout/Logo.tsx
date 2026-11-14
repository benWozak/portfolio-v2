"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSmoothScroll } from "@/utils/hooks/useSmoothScroll";

const logoProps = {
  width: 187.8,
  height: 216,
  fetchPriority: "high",
} as const;

export default function Logo() {
  const { scrollToTop } = useSmoothScroll();
  const pathname = usePathname();

  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      scrollToTop();
    }
  };

  // Both variants are rendered and CSS shows one. next-themes puts the `dark`
  // class on <html> before first paint, so the right logo shows without a flash
  // and the server and client markup match. Neither image is preloaded: lazy
  // loading (the default) fetches only the variant that is displayed.
  return (
    <Link
      href="/"
      className="block hover:cursor-pointer"
      onClick={handleLogoClick}
    >
      <Image
        {...logoProps}
        alt="Brand Logo"
        src="/BW_logo.svg"
        className="h-16 w-auto dark:hidden"
      />
      <Image
        {...logoProps}
        alt="Brand Logo"
        src="/BW_logo_light.svg"
        className="hidden h-16 w-auto dark:block"
      />
    </Link>
  );
}
