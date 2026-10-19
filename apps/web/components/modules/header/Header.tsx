"use client";

import React, { useState } from "react";
import { FileText, Menu, X } from "lucide-react";
import KhangVietLogo from "@/ui/KhangVietLogo";
import PhoneCallButton from "../../ui/PhoneCallButton";
import { useModalContext } from "../../modals/modalContext";
import { HeaderMobileNav } from "./HeaderMobileNav";

export const NAV_ITEMS = [
  { number: "01.", label: "Dự án", href: "#du-an" },
  { number: "02.", label: "Lĩnh vực", href: "#linh-vuc" },
  { number: "03.", label: "Năng lực xưởng", href: "#nang-luc" },
  { number: "04.", label: "Về Khang Việt", href: "#ve-khang-viet" },
];

export interface HeaderProps {
  onOpenProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenProfile }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openProfileModal } = useModalContext();

  const handleOpen = () => {
    if (onOpenProfile) onOpenProfile();
    else openProfileModal("profile");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-(--bg-obsidian)/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-360 items-center justify-between gap-6 px-5 md:px-8 xl:px-12">
        <a
          href="#top"
          aria-label="Khang Việt Design — Trang chủ"
          className="shrink-0"
        >
          <KhangVietLogo compact className="h-10" />
        </a>

        <nav
          className="hidden items-center gap-7 lg:flex xl:gap-9"
          aria-label="Điều hướng chính"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group text-xs font-medium text-(--text-secondary) transition-colors hover:text-(--text-primary)"
            >
              <span className="font-mono-tech mr-1.5 text-[10px] text-(--accent-bronze)">
                {item.number}
              </span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={handleOpen}
            className="hidden cursor-pointer items-center gap-2 border border-(--border-bronze-subtle) px-4 py-2.5 text-[10px] font-semibold tracking-[0.12em] text-(--accent-bronze) uppercase transition-colors hover:bg-(--accent-bronze) hover:text-(--bg-obsidian) xl:flex"
          >
            <FileText className="h-3.5 w-3.5" />
            Hồ sơ năng lực
          </button>
          <PhoneCallButton variant="compact" />
        </div>

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
          onClose={() => setMobileMenuOpen(false)}
          onOpenProfile={handleOpen}
        />
      )}
    </header>
  );
};

export default Header;
