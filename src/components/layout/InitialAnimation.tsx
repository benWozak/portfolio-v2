"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const words = ["Your Vision", "Expertly Developed"];

export default function InitialAnimation({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (currentWordIndex < words.length) {
      if (currentText.length < words[currentWordIndex].length) {
        const timer = setTimeout(() => {
          setCurrentText(
            words[currentWordIndex].slice(0, currentText.length + 1)
          );
        }, 60); // typing speed
        return () => clearTimeout(timer);
      } else if (currentWordIndex === 0) {
        const timer = setTimeout(() => {
          setCurrentWordIndex(1);
          setCurrentText("");
        }, 1000); // pause between words
        return () => clearTimeout(timer);
      } else {
        setIsTypingComplete(true);
      }
    }
  }, [currentWordIndex, currentText]);

  useEffect(() => {
    if (isTypingComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 1000); // delay before fading out
      return () => clearTimeout(timer);
    }
  }, [isTypingComplete, onComplete]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530); // Blinking speed
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center bg-background text-foreground"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="text-3xl md:text-6xl font-bold font-mono">
          {currentText}
          <span
            className={`inline-block w-0.5 h-10 lg:h-16 ml-1 ${
              showCursor ? "bg-foreground" : "bg-transparent"
            }`}
          >
            &nbsp;
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
