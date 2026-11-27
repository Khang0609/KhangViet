import React from "react";
import { cn } from "@/lib/ultis";

export interface KhangVietLogoProps {
  className?: string;
  compact?: boolean;
}

/**
 * Renders Khang Việt Design's official vector logo from /logo.svg.
 */
export default function KhangVietLogo({
  className = "",
  compact = false,
}: KhangVietLogoProps) {
  return (
    <div
      className={cn("group inline-flex items-center select-none", className)}
    >
      <img src="./Logo-large.svg" alt="Logo Khang Viet design" />
    </div>
  );
}
