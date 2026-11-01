// src/components/content/projects/case-study/Reveal.tsx
"use client";

import { motion } from "framer-motion";
import { itemVariants } from "@/components/layout/section/AnimatedSection";

export function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
