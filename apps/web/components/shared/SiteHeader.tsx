"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Menu, X } from "lucide-react";
import KhangVietLogo from "@/ui/KhangVietLogo";
import PhoneCallButton from "../ui/PhoneCallButton";
import { useOptionalModalContext } from "../modals/modalContext";
import { HeaderMobileNav } from "../modules/header/HeaderMobileNav";

export const SITE_NAV_ITEMS = [
  { number: "01.", label: "Trang chủ", href: "/" },
  { number: "02.", label: "Kho dự án", href: "/projects" },
  { number: "03.", label: "Cửa hàng", href: "/shop" },
] as const;

export interface SiteHeaderProps {
  onOpenProfile?: () => void;
  showHomeActions?: boolean;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  onOpenProfile,
  showHomeActions,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const modalContext = useOptionalModalContext();

  const isHome = showHomeActions ?? pathname === "/";

  const handleOpenProfile = () => {
    if (onOpenProfile) {
      onOpenProfile();
    } else {
      modalContext?.openProfileModal("profile");
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-(--bg-obsidian)/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-360 items-center justify-between gap-6 px-5 md:px-8 xl:px-12">
        <Link
          href="/"
          aria-label="Khang Việt Design — Trang chủ"
          className="shrink-0"
        >
          <KhangVietLogo compact className="h-10" />
        </Link>

        <nav
          className="hidden items-center gap-7 lg:flex xl:gap-9"
          aria-label="Điều hướng chính"
        >
          {SITE_NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group text-xs font-medium transition-colors ${
                  isActive
                    ? "text-(--text-primary)"
                    : "text-(--text-secondary) hover:text-(--text-primary)"
                }`}
              >
                <span className="font-mono-tech mr-1.5 text-[10px] text-(--accent-bronze)">
                  {item.number}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {isHome ? (
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={handleOpenProfile}
              className="hidden cursor-pointer items-center gap-2 border border-(--border-bronze-subtle) px-4 py-2.5 text-[10px] font-semibold tracking-[0.12em] text-(--accent-bronze) uppercase transition-colors hover:bg-(--accent-bronze) hover:text-(--bg-obsidian) xl:flex"
            >
              <FileText className="h-3.5 w-3.5" />
              Hồ sơ năng lực
            </button>
            <PhoneCallButton variant="compact" />
          </div>
        ) : (
          <div className="hidden w-10 sm:block lg:hidden" aria-hidden="true" />
        )}

        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="cursor-pointer border border-white/10 p-2.5 text-(--text-primary) lg:hidden"
          aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <HeaderMobileNav
          pathname={pathname}
          showProfileAction={isHome}
          onClose={() => setMobileMenuOpen(false)}
          onOpenProfile={handleOpenProfile}
        />
      )}
    </header>
  );
};

export default SiteHeader;
