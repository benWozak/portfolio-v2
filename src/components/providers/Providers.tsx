"use client";

import { ThemeProvider } from "next-themes";
import { MotionConfig } from "motion/react";

/**
 * Client providers for the (app) tree:
 * - next-themes: class-based dark mode with FOUC-free inline script; the
 *   default storageKey ("theme") and values (light/dark/system) match the
 *   previous hand-rolled ThemeContext, so stored preferences carry over.
 * - MotionConfig reducedMotion="user": disables motion transform/
 *   layout animations for users with prefers-reduced-motion set.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ThemeProvider>
  );
}
