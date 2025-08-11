"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import "../../styles/payload-admin.css";

const PayloadLogo: React.FC = () => {
  const [logoSrc, setLogoSrc] = useState("/BW_logo.svg");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const updateLogoSrc = () => {
      const adminEl = document.querySelector("[data-theme]");
      const isDarkMode = adminEl?.getAttribute("data-theme") === "dark";

      if (!adminEl) {
        const systemDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        setLogoSrc(systemDark ? "/BW_logo_light.svg" : "/BW_logo.svg");
      } else {
        setLogoSrc(isDarkMode ? "/BW_logo_light.svg" : "/BW_logo.svg");
      }
    };

    updateLogoSrc();

    // Listen for theme changes on the document
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-theme"
        ) {
          updateLogoSrc();
        }
      });
    });

    // Observe theme changes on document body and html elements
    const targetElements = [document.documentElement, document.body];
    targetElements.forEach((el) => {
      if (el) {
        observer.observe(el, {
          attributes: true,
          attributeFilter: ["data-theme", "class"],
        });
      }
    });

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => updateLogoSrc();
    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, []);

  if (!mounted) {
    return <div style={{ width: "200px", height: "48px" }} />;
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "1rem 0",
      }}
    >
      <Image
        src={logoSrc}
        alt="Admin Panel"
        width={200}
        height={48}
        style={{ height: "auto", maxWidth: "200px" }}
        priority
      />
    </div>
  );
};

export default PayloadLogo;
