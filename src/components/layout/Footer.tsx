"use client";

import { useState, useEffect } from "react";
import Logo from "./Logo";
import { LinkButton } from "../ui/LinkButton";
import { Socials } from "../content";
import { useNavigation } from "@/utils/hooks";

type Props = {};

export function Footer({}: Props) {
  const [isScrolled, setIsScrolled] = useState(false);
  const navItems = useNavigation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <footer className="text-sm text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <Logo />
        </div>

        {/* <p className="mx-auto mt-6 max-w-md text-center leading-relaxed text-gray-500">
          Your vision, expertly developed - from concept to completion.
          Transforming innovative ideas into impactful digital experiences.
        </p> */}

        <ul className="mt-8 flex flex-wrap justify-center gap-6 md:gap-8 lg:gap-12">
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

        <div className="mt-8 flex justify-center gap-6 md:gap-8">
          <Socials size="md" />
        </div>
      </div>
    </footer>
  );
}
