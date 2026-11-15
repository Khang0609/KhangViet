"use client";

import React from "react";
import { Phone, PhoneCall } from "lucide-react";
import { useLegalInfo } from "@/components/contexts/LandingContext";

export interface PhoneCallButtonProps {
  variant?: "compact" | "filled" | "outline" | "icon-only";
  label?: string;
  className?: string;
  phoneNumber?: string;
}

export const PhoneCallButton: React.FC<PhoneCallButtonProps> = ({
  variant = "outline",
  label,
  className = "",
  phoneNumber,
}) => {
  const legal = useLegalInfo();
  const activePhone = phoneNumber || legal.hotline;
  const activeLabel = label || legal.hotlineFormatted || activePhone;
  const telHref = `tel:${activePhone.replace(/\s+/g, "")}`;

  if (variant === "icon-only") {
    return (
      <a
        href={telHref}
        aria-label={`Gọi ${activeLabel}`}
        className={`flex h-12 w-12 shrink-0 items-center justify-center bg-(--accent-bronze) text-black transition-colors hover:bg-(--accent-bronze-light) ${className}`}
      >
        <Phone className="h-5 w-5" />
      </a>
    );
  }

  if (variant === "filled") {
    return (
      <a
        href={telHref}
        className={`flex items-center justify-center gap-2 bg-(--accent-bronze) px-4 py-3 text-xs font-semibold tracking-wider text-black uppercase transition-colors hover:bg-(--accent-bronze-light) ${className}`}
      >
        <PhoneCall className="h-3.5 w-3.5" />
        {activeLabel}
      </a>
    );
  }

  if (variant === "compact") {
    return (
      <a
        href={telHref}
        className={`inline-flex items-center gap-2 px-2 py-2 text-xs font-medium text-[#1a1918] tabular-nums transition-colors hover:text-(--accent-bronze) ${className}`}
      >
        <Phone className="h-3.5 w-3.5 text-[#625f5a]" />
        {activeLabel}
      </a>
    );
  }

  return (
    <a
      href={telHref}
      className={`font-mono-tech flex items-center justify-center gap-2 border border-white/10 bg-white/3 px-3.5 py-2.5 text-[11px] transition-colors hover:border-(--accent-bronze) hover:text-(--accent-bronze) ${className}`}
    >
      <span className="h-1.5 w-1.5 bg-(--accent-bronze) shadow-[0_0_10px_var(--accent-bronze)]" />
      {activeLabel}
    </a>
  );
};

export default PhoneCallButton;
