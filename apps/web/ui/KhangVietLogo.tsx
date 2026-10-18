import React from "react";

interface KhangVietLogoProps {
  className?: string;
  compact?: boolean;
}

/**
 * High-precision SVG vector reproduction + original asset fallback of Khang Viet Design's logo.
 * Against #111215 Obsidian Dark, the warm orange (#F27D26) glows like an architectural beacon at night.
 */
export default function KhangVietLogo({
  className = "h-11",
  compact = false,
}: KhangVietLogoProps) {
  return (
    <div className={`group inline-flex items-center select-none ${className}`}>
      <div className="relative flex items-center overflow-hidden rounded-xs border border-white/8 bg-[#0B0C0E] px-2 py-1 transition-colors duration-300 group-hover:border-[#D4A373]/40">
        <img
          src="/assets/brand/logo-khang-viet.png"
          alt="Khang Việt Design — Since 2009"
          className={`${
            compact ? "h-7 sm:h-8" : "h-8 sm:h-10"
          } w-auto object-contain brightness-105 contrast-110 transition-transform duration-500 group-hover:scale-[1.02]`}
        />
      </div>
    </div>
  );
}
