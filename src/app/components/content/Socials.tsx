import React from "react";
import Link from "next/link";
import { SiGithub, SiLinkedin } from "react-icons/si";

type Props = {
  size: "sm" | "md" | "lg" | "xl";
};

const SIZE_VARIANTS = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

export function Socials({ size }: Props) {
  console.log(SIZE_VARIANTS[size]);
  return (
    <div className="flex flex-wrap gap-4 justify-center max-w-2xl">
      <div className="w-6 h-6">
        <Link
          href="https://github.com/benWozak"
          target="_blank"
          aria-label="github"
        >
          <SiGithub
            size={size ? SIZE_VARIANTS[size] : 24}
            className="text-foreground/70 hover:text-secondary-500 transition-all"
          />
        </Link>
      </div>
      <div className="w-6 h-6">
        <Link
          href="https://linkedin.com/in/ben-wozak"
          target="_blank"
          aria-label="linkedin"
        >
          <SiLinkedin
            size={size ? SIZE_VARIANTS[size] : 24}
            className="text-foreground/70 hover:text-secondary-500 transition-all"
          />
        </Link>
      </div>
    </div>
  );
}
