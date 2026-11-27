"use client";

import React, { useState } from "react";
import { ArrowDown, ArrowUpRight, PhoneCall } from "lucide-react";
import type { HeroSlide } from "@/types/landing";
import {
  useHeroSlides,
  useLegalInfo,
} from "@/components/contexts/LandingContext";
import { useCarousel } from "@/hooks/useCarousel";
import { useActiveSection } from "@/hooks/useActiveSection";
import { formatPhone, normalizePhone } from "@/lib/phone";
import { cn } from "@/lib/ultis";
import KhangVietLogo from "@/ui/KhangVietLogo";

const NAV_LINKS = [
  { label: "Trang chủ", href: "/#top" },
  { label: "Công trình", href: "/#du-an" },
  { label: "Dịch vụ", href: "/#dich-vu" },
  { label: "Liên hệ", href: "/#contact-gate" },
] as const;

/**
 * 20x20 concave corner fillet SVG for seamless notched white cutout tabs.
 */
function CornerFillet({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "pointer-events-none h-(--radius-frame) w-(--radius-frame)",
        className,
      )}
      aria-hidden="true"
    >
      <path d="M0 0H20C8.954 0 0 8.954 0 20V0Z" fill="#FFFFFF" />
    </svg>
  );
}

export interface HeroSectionProps {
  slides?: HeroSlide[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({ slides }) => {
  const contextSlides = useHeroSlides();
  const legal = useLegalInfo();
  const { handleNavClick } = useActiveSection();

  const activeSlides = slides && slides.length > 0 ? slides : contextSlides;
  const { currentIndex, goTo } = useCarousel(activeSlides.length, 4500);
  const [menuOpen, setMenuOpen] = useState(false);

  const normalizedPhone = normalizePhone(legal.hotline);
  const formattedPhone = formatPhone(legal.hotline);

  return (
    <section id="top" className="bg-white p-3 sm:p-4">
      <div className="relative">
        {/* Top-Left White Notched Cutout Tab (Sibling outside overflow-hidden) */}
        <div className="absolute top-0 left-0 z-30 rounded-br-(--radius-frame) bg-white pt-2.5 pr-5 pb-3 pl-3 sm:pt-3 sm:pr-6 sm:pb-3.5 sm:pl-4">
          <a
            href="#top"
            onClick={(e) => {
              setMenuOpen(false);
              handleNavClick(e, "/#top");
            }}
            aria-label="Khang Việt Design — Trang chủ"
            className="block"
          >
            <KhangVietLogo compact className="w-60" />
          </a>
          <CornerFillet className="absolute top-0 -right-(--radius-frame)" />
          <CornerFillet className="absolute -bottom-(--radius-frame) left-0" />
        </div>

        {/* Top-Right White Notched Cutout Tab (Sibling outside overflow-hidden) */}
        <div className="absolute top-0 right-0 z-30 rounded-bl-(--radius-frame) bg-white pt-3 pr-4 pb-3.5 pl-5 sm:pt-3.5 sm:pr-5 sm:pb-4 sm:pl-6">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={menuOpen}
            className="transition-color flex h-12 w-12 cursor-pointer flex-col items-center justify-center gap-2"
          >
            <div
              className={cn(
                "h-0.5 w-8 rounded-full bg-[#1e1e1e] transition-all duration-300",
                menuOpen && "translate-y-2.5 rotate-45",
              )}
            />
            <div
              className={cn(
                "h-0.5 w-8 rounded-full bg-[#1e1e1e] transition-all duration-200",
                menuOpen && "opacity-0",
              )}
            />
            <div
              className={cn(
                "h-0.5 w-8 rounded-full bg-[#1e1e1e] transition-all duration-300",
                menuOpen && "-translate-y-2.5 -rotate-45",
              )}
            />
          </button>
          <CornerFillet className="absolute top-0 -left-(--radius-frame) rotate-90" />
          <CornerFillet className="absolute right-0 -bottom-(--radius-frame) rotate-90" />
        </div>

        <div className="relative flex min-h-[calc(100svh-1.5rem)] items-center justify-center overflow-hidden rounded-(--radius-frame) bg-white sm:min-h-[calc(100svh-2rem)]">
          {/* Background Project Carousel */}
          <div className="absolute inset-0 z-0 bg-[#1e1e1e]">
            {activeSlides.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className={`h-full w-full object-cover transition-transform duration-4500 ease-out ${
                      isActive ? "scale-100" : "scale-105"
                    }`}
                  />
                </div>
              );
            })}
            {/* Soft dark-warm scrim so frosted blur card pops cleanly */}
            <div className="absolute inset-0 bg-black/28" />
          </div>

          {/* Expanded Dark Charcoal Menu Overlay inside the same Notched Hero Frame */}
          <div
            className={`bg-blueprint-grid absolute inset-0 z-20 flex flex-col justify-between bg-[#2b2926]/98 px-8 pt-28 pb-10 transition-all duration-300 sm:px-14 sm:pt-32 ${
              menuOpen
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0"
            }`}
            aria-hidden={!menuOpen}
          >
            <nav
              className="mt-10 flex flex-col items-start gap-2 sm:gap-3"
              aria-label="Điều hướng chính"
            >
              {NAV_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    setMenuOpen(false);
                    handleNavClick(e, item.href);
                  }}
                  className="text-[clamp(2.25rem,5vw,4rem)] leading-[1.12] font-bold tracking-[-0.03em] text-white transition-colors hover:text-[#C93818]"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/12 pt-6">
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href={`tel:${normalizedPhone}`}
                  className="inline-flex items-center gap-2.5 rounded-full bg-[#C93818] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#AE2E12]"
                >
                  <PhoneCall className="h-4 w-4" />
                  {formattedPhone}
                </a>
                <a
                  href={`https://zalo.me/${normalizedPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  Zalo
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Center Hero Headline with Frosted Background Blur */}
          <div className="relative z-10 mx-auto max-w-4xl px-5 text-center">
            <div className="rounded-[28px] border border-white/45 bg-[#f7f4e6]/20 px-6 py-9 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.35)] backdrop-blur-xs sm:px-12 sm:py-12">
              <h1 className="text-[clamp(2.2rem,5.4vw,4.75rem)] leading-[1.04] font-bold tracking-[-0.035em] text-[#1e1e1e]">
                Kiến tạo diện mạo thương hiệu đỉnh cao.
              </h1>

              <div className="mt-7 flex justify-center sm:mt-9">
                <a
                  href="#du-an"
                  onClick={(e) => handleNavClick(e, "/#du-an")}
                  aria-label="Khám phá công trình tiêu biểu"
                  className="group flex h-14 w-14 items-center justify-center rounded-full bg-[#C93818] text-white shadow-lg transition-all duration-300 hover:scale-108 hover:bg-[#AE2E12]"
                >
                  <ArrowDown className="h-5 w-5 transition-transform duration-300 group-hover:translate-y-0.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Carousel Indicator + Active Project Caption */}
          {activeSlides.length > 1 && (
            <div className="absolute inset-x-6 bottom-5 z-10 flex items-center justify-between gap-4 sm:inset-x-8 sm:bottom-6">
              <div className="hidden rounded-full bg-black/45 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md sm:block">
                {activeSlides[currentIndex]?.title}
              </div>
              <div className="ml-auto flex items-center gap-2 rounded-full bg-black/35 px-3 py-2 backdrop-blur-md">
                {activeSlides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => goTo(idx)}
                    aria-label={`Xem ảnh ${idx + 1}: ${slide.title}`}
                    className={`h-2 cursor-pointer rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? "w-6 bg-[#C93818]"
                        : "w-2 bg-white/55 hover:bg-white"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
