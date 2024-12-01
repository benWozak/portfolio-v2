"use client";
import Image from "next/image";
import { useTheme } from "@/app/contexts/ThemeContext";

export default function Logo() {
  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? "/BW_logo_light.svg" : "/BW_logo.svg";

  return (
    <Image
      src={logoSrc}
      alt="Brand Logo"
      width={187.8}
      height={216}
      className="h-16 w-auto"
    />
  );
}
