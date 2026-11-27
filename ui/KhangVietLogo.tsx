import React from "react";
import Image from "next/image";
import { cn } from "@/lib/ultis";

export interface KhangVietLogoProps {
  className?: string;
  compact?: boolean;
}

/**
 * Renders Khang Việt Design's official vector logo from /Logo-large.svg.
 */
export default function KhangVietLogo({
  className = "",
}: KhangVietLogoProps) {
  return (
    <div
      className={cn("group inline-flex items-center select-none", className)}
    >
      <Image
        src="/Logo-large.svg"
        alt="Logo Khang Viet design"
        width={240}
        height={64}
        className="h-auto w-full"
      />
    </div>
  );
}
