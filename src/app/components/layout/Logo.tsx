"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useSmoothScroll } from "@/utils/hooks/useSmoothScroll";

export default function Logo() {
  const { scrollToTop } = useSmoothScroll();
  const { theme } = useTheme();
  const [logoSrc, setLogoSrc] = useState("/BW_logo.svg");
  const pathname = usePathname();

  useEffect(() => {
    const updateLogoSrc = () => {
      if (theme === "system") {
        const isDarkMode = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        setLogoSrc(isDarkMode ? "/BW_logo_light.svg" : "/BW_logo.svg");
      } else {
        setLogoSrc(theme === "dark" ? "/BW_logo_light.svg" : "/BW_logo.svg");
      }
    };

    updateLogoSrc();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addListener(updateLogoSrc);

    return () => mediaQuery.removeListener(updateLogoSrc);
  }, [theme]);

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
      />
    </Link>
  );
}
