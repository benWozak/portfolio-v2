import React from "react";
import Link from "next/link";
import { SiGithub, SiLinkedin } from "react-icons/si";

type Props = {};

export function Socials({}: Props) {
  return (
    <div className="flex flex-wrap gap-4 justify-center max-w-2xl">
      <div className="w-6 h-6">
        <Link
          href="https://github.com/benWozak"
          target="_blank"
          aria-label="github"
        >
          <SiGithub
            size={24}
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
            size={24}
            className="text-foreground/70 hover:text-secondary-500 transition-all"
          />
        </Link>
      </div>
    </div>
  );
}
