"use client";

// import { useState, useEffect } from "react";
import Logo from "./Logo";
import { LinkButton } from "../ui/LinkButton";
import { Socials } from "../content";
import { useNavigation } from "@/utils/hooks";

// type Props = Record<string, never>;

export function Footer() {
  // const [isScrolled, setIsScrolled] = useState(false);
  const navItems = useNavigation();

  // useEffect(() => {
  //   const handleScroll = () => {
  //     setIsScrolled(window.scrollY > 0);
  //   };

  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, []);

  return (
    <footer className="text-sm text-foreground">
      <div className="flex flex-col items-center justify-center gap-4 mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <Logo />
        <ul className="flex flex-wrap gap-6 md:gap-8 lg:gap-12">
          {navItems.map((item) => {
            return (
              <li key={item.href}>
                <LinkButton
                  href={item.href}
                  className="text-gray-700 dark:text-gray-200 transition hover:text-gray-700/75"
                >
                  {item.label}
                </LinkButton>
              </li>
            );
          })}
        </ul>
        <Socials size="md" />
        <sub className="mt-4">
          © {new Date().getFullYear()} Ben Wozak. All rights reserved.
        </sub>
      </div>
    </footer>
  );
}
