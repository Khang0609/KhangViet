import React from "react";
import KhangVietLogo from "@/ui/KhangVietLogo";

interface BrandLogoProps {
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = "" }) => (
  <a
    href="#top"
    aria-label="Khang Việt Design — Trang chủ"
    className={`shrink-0 ${className}`}
  >
    <KhangVietLogo compact className="h-10" />
  </a>
);
