"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const words = ["Your Vision", "//", "Expertly Developed"];

export default function InitialAnimation({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  useEffect(() => {
    if (currentWordIndex < words.length) {
      const timer = setTimeout(() => {
        setCurrentWordIndex(currentWordIndex + 1);
      }, 1000); // Adjust this value to control the delay between words
      return () => clearTimeout(timer);
    } else if (!isAnimationComplete) {
      const timer = setTimeout(() => {
        setIsAnimationComplete(true);
        onComplete();
      }, 1000); // Delay before transitioning to the home page
      return () => clearTimeout(timer);
    }
  }, [currentWordIndex, isAnimationComplete, onComplete]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black text-white">
      <div className="text-4xl md:text-6xl font-bold">
        {words.map((word, index) => (
          <motion.span
            key={word}
            className="inline-block mr-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: index <= currentWordIndex ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            {word}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
