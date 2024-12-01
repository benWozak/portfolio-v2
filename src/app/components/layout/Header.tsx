"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { LinkButton } from "../ui/LinkButton";

type Props = {};

export function Header({}: Props) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled
          ? "bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-1 md:flex md:items-center md:gap-12">
            <a className="block text-teal-600" href="#">
              <Logo />
            </a>
          </div>

          <div className="md:flex md:items-center md:gap-12">
            <nav aria-label="Global" className="hidden md:block">
              <ul className="flex items-center gap-6 text-sm">
                <li>
                  <LinkButton href="#about">About</LinkButton>
                </li>
                <li>
                  <LinkButton href="#services">Services</LinkButton>
                </li>
                <li>
                  <LinkButton href="#projects">Projects</LinkButton>
                </li>
                <li>
                  <LinkButton href="#contact">Contact</LinkButton>
                </li>
              </ul>
            </nav>

            <div className="flex items-center gap-4">
              <div className="sm:flex sm:gap-4">
                <ThemeToggle />
              </div>

              <div className="block md:hidden">
                <button
                  className="rounded bg-gray-100 p-2 text-gray-600 transition hover:text-gray-600/75 dark:bg-gray-800 dark:text-gray-300"
                  onClick={toggleMobileMenu}
                  aria-expanded={isMobileMenuOpen}
                  aria-label="Toggle mobile menu"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`fixed inset-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md`}
          >
            <div className="flex h-full flex-col items-center justify-center">
              <button
                onClick={toggleMobileMenu}
                className="absolute top-4 right-4 p-2 text-gray-600 dark:text-gray-300"
                aria-label="Close mobile menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <nav className="text-center">
                <ul className="space-y-8">
                  <li>
                    <LinkButton href="#about" onClick={toggleMobileMenu}>
                      About
                    </LinkButton>
                  </li>
                  <li>
                    <LinkButton href="#services" onClick={toggleMobileMenu}>
                      Services
                    </LinkButton>
                  </li>
                  <li>
                    <LinkButton href="#projects" onClick={toggleMobileMenu}>
                      Projects
                    </LinkButton>
                  </li>
                  <li>
                    <LinkButton href="#contact" onClick={toggleMobileMenu}>
                      Contact
                    </LinkButton>
                  </li>
                </ul>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
