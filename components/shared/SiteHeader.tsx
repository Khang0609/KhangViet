"use client";

import React from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import KhangVietLogo from "@/ui/KhangVietLogo";
import { useActiveSection } from "@/hooks/useActiveSection";
import PhoneCallButton from "../ui/PhoneCallButton";
import { useOptionalModalContext } from "../modals/modalContext";

export const SITE_NAV_ITEMS = [
  { number: "01.", label: "Trang chủ", href: "/#top" },
  { number: "02.", label: "Công trình", href: "/#du-an" },
  { number: "03.", label: "Liên hệ", href: "/#contact-gate" },
] as const;

export interface SiteHeaderProps {
  onOpenProfile?: () => void;
  showHomeActions?: boolean;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  onOpenProfile,
  showHomeActions,
}) => {
  const { activeHref, handleNavClick } = useActiveSection();
  const modalContext = useOptionalModalContext();

  const showActions = showHomeActions ?? true;
  const canOpenProfile = Boolean(onOpenProfile || modalContext);

  const handleOpenProfile = () => {
    if (onOpenProfile) {
      onOpenProfile();
    } else {
      modalContext?.openProfileModal("profile");
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-black/8 bg-[#f4f1ea]/90 backdrop-blur-md">
      <div className="relative mx-auto flex h-20 max-w-360 items-center justify-between gap-4 px-5 md:px-8 xl:px-12">
        <Link
          href="/"
          aria-label="Khang Việt Design — Trang chủ"
          className="shrink-0"
        >
          <KhangVietLogo compact className="h-10" />
        </Link>

        <nav
          className="hidden items-center gap-8 lg:absolute lg:left-1/2 lg:flex lg:-translate-x-1/2 xl:gap-10"
          aria-label="Điều hướng chính"
        >
          {SITE_NAV_ITEMS.map((item) => {
            const isActive = activeHref === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`relative py-1 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-(--accent-bronze)"
                    : "text-[#625f5a] hover:text-[#1a1918]"
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-(--accent-bronze)" />
                )}
              </Link>
            );
          })}
        </nav>

        {showActions && (
          <div className="flex items-center gap-3">
            {canOpenProfile && (
              <button
                type="button"
                onClick={handleOpenProfile}
                className="hidden cursor-pointer items-center gap-2 rounded-full border border-black/12 bg-white/70 px-4 py-2 text-xs font-medium text-[#1a1918] transition-colors hover:border-[#1a1918] hover:bg-white xl:flex"
              >
                <FileText className="h-3.5 w-3.5 text-(--accent-bronze)" />
                Hồ sơ năng lực
              </button>
            )}
            <PhoneCallButton variant="compact" />
          </div>
        )}
      </div>
    </header>
  );
};

export default SiteHeader;
