"use client";

import { useState } from "react";
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

  if (!showHomePage) {
    return <InitialAnimation onComplete={handleAnimationComplete} />;
  }

  return <>{children}</>;
}
