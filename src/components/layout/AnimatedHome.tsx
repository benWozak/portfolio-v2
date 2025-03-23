"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InitialAnimation from "./InitialAnimation";

const ANIMATION_SHOWN_KEY = "animationShown";
const ANIMATION_TIMESTAMP_KEY = "animationTimestamp";
const EXPIRATION_TIME = 24 * 60 * 60 * 1000; // extends reset to 24 hours

export default function AnimatedHome({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showHomePage, setShowHomePage] = useState(true);

  useEffect(() => {
    const checkAnimationStatus = () => {
      const animationShown = sessionStorage.getItem(ANIMATION_SHOWN_KEY);
      const animationTimestamp = localStorage.getItem(ANIMATION_TIMESTAMP_KEY);

      if (!animationShown) {
        const currentTime = new Date().getTime();
        if (
          !animationTimestamp ||
          currentTime - parseInt(animationTimestamp) > EXPIRATION_TIME
        ) {
          setShowHomePage(false);
          sessionStorage.setItem(ANIMATION_SHOWN_KEY, "true");
          localStorage.setItem(ANIMATION_TIMESTAMP_KEY, currentTime.toString());
        }
      }
    };

    checkAnimationStatus();
  }, []);

  const handleAnimationComplete = () => {
    setShowHomePage(true);
  };

  return (
    <AnimatePresence mode="wait">
      {!showHomePage ? (
        <motion.div
          className="z-50"
          key="initial-animation"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
        >
          <InitialAnimation onComplete={handleAnimationComplete} />
        </motion.div>
      ) : (
        <motion.div
          key="home-page"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
