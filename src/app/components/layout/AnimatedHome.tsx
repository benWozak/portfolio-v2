"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InitialAnimation from "./InitialAnimation";

export default function AnimatedHome({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showHomePage, setShowHomePage] = useState(false);

  const handleAnimationComplete = () => {
    setShowHomePage(true);
  };

  return (
    <AnimatePresence mode="wait">
      {!showHomePage ? (
        <motion.div
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
