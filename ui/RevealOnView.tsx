"use client";

import React from "react";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/ultis";

interface RevealOnViewProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  threshold?: number;
}

export const RevealOnView: React.FC<RevealOnViewProps> = ({
  children,
  className,
  delayMs = 0,
  threshold = 0.2,
}) => {
  const { ref, inView } = useInView(threshold);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        inView ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
        className,
      )}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
};
