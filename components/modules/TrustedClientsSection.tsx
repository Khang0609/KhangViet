"use client";

import React from "react";
import { useInView } from "@/hooks/useInView";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { cn } from "@/lib/ultis";

interface BrandItem {
  name: string;
  weight?: string;
  tracking?: string;
}

const ROW_1_LEFT: BrandItem[] = [
  { name: "HELLO BnB", weight: "font-bold", tracking: "tracking-wide" },
  { name: "VinGroup", weight: "font-extrabold", tracking: "tracking-tight" },
  { name: "BIDV", weight: "font-black", tracking: "tracking-wider" },
  { name: "kingsmen", weight: "font-bold", tracking: "tracking-tight" },
];

const ROW_1_RIGHT: BrandItem[] = [
  { name: "EXIMBANK", weight: "font-extrabold", tracking: "tracking-wide" },
  { name: "GO!", weight: "font-black", tracking: "tracking-tight" },
  { name: "VINCOM", weight: "font-bold", tracking: "tracking-[0.16em]" },
  { name: "DECATHLON", weight: "font-black", tracking: "tracking-wide" },
];

const ROW_2_LEFT: BrandItem[] = [
  { name: "DIOR", weight: "font-semibold", tracking: "tracking-[0.22em]" },
  { name: "TRUNG NGUYÊN", weight: "font-bold", tracking: "tracking-wider" },
  { name: "Calvin Klein", weight: "font-medium", tracking: "tracking-wide" },
  { name: "GUMAC", weight: "font-extrabold", tracking: "tracking-[0.14em]" },
];

const ROW_2_RIGHT: BrandItem[] = [
  { name: "xiaomi", weight: "font-bold", tracking: "tracking-tight" },
  { name: "THE newgym", weight: "font-extrabold", tracking: "tracking-tight" },
  { name: "THƯƠNG XÁ TAX", weight: "font-bold", tracking: "tracking-wide" },
  { name: "KHANG HƯNG", weight: "font-extrabold", tracking: "tracking-wider" },
];

const ROW_3_LEFT: BrandItem[] = [
  { name: "VINCOM", weight: "font-bold", tracking: "tracking-[0.16em]" },
  { name: "EXIMBANK", weight: "font-extrabold", tracking: "tracking-wide" },
  { name: "GO!", weight: "font-black", tracking: "tracking-tight" },
  { name: "BIDV", weight: "font-black", tracking: "tracking-wider" },
];

const ROW_3_RIGHT: BrandItem[] = [
  { name: "kingsmen", weight: "font-bold", tracking: "tracking-tight" },
  { name: "DIOR", weight: "font-semibold", tracking: "tracking-[0.22em]" },
  { name: "Calvin Klein", weight: "font-medium", tracking: "tracking-wide" },
  { name: "VinGroup", weight: "font-extrabold", tracking: "tracking-tight" },
];

function BrandPill({ brand }: { brand: BrandItem }) {
  return (
    <div className="flex h-14 w-28 shrink-0 items-center justify-center rounded-xl bg-white px-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:h-24 sm:w-52 sm:rounded-2xl sm:px-5">
      <span
        className={cn(
          "text-center text-[11px] text-[#2A2A27] select-none sm:text-base",
          brand.weight ?? "font-bold",
          brand.tracking ?? "tracking-normal",
        )}
      >
        {brand.name}
      </span>
    </div>
  );
}

interface ScrollRowConfig {
  left: BrandItem[];
  right: BrandItem[];
  label: string;
  direction: 1 | -1;
  revealDelayMs: number;
}

const SCROLL_ROWS: ScrollRowConfig[] = [
  {
    left: ROW_1_LEFT,
    right: ROW_1_RIGHT,
    label: "Tin cậy",
    direction: 1,
    revealDelayMs: 0,
  },
  {
    left: ROW_2_LEFT,
    right: ROW_2_RIGHT,
    label: "bởi nhiều",
    direction: -1,
    revealDelayMs: 140,
  },
  {
    left: ROW_3_LEFT,
    right: ROW_3_RIGHT,
    label: "nhãn hàng",
    direction: 1,
    revealDelayMs: 280,
  },
];

export const TrustedClientsSection: React.FC = () => {
  const { ref, inView } = useInView(0.4);
  const scrollProgress = useScrollProgress(ref);

  // Range: at progress=0.5 (center of viewport), offset is 0px so all 3 words align centrally.
  const travelPx = 280;
  const delta = (scrollProgress - 0.5) * travelPx;

  return (
    <div
      ref={ref}
      className="relative z-10 -mx-3 mt-20 pt-8 pb-6 sm:-mx-12 sm:mt-36 sm:pt-16 sm:pb-10"
    >
      {/* Mobile Headline */}
      <div className="mb-8 px-6 text-center md:hidden">
        <h3 className="text-[clamp(2rem,8vw,2.75rem)] leading-[1.08] font-bold tracking-[-0.03em] text-[#1e1e1e]">
          {SCROLL_ROWS.map((r) => r.label).join(" ")}
        </h3>
      </div>

      {/* Desktop 3-Row Scroll-Linked Rows (inline word + brand pills move together on scroll) */}
      <div className="hidden space-y-4 overflow-hidden md:block">
        {SCROLL_ROWS.map((row) => {
          const translateX = delta * row.direction;
          return (
            <div key={row.label} className="flex justify-center">
              <div
                className="flex items-center gap-4 will-change-transform"
                style={{ transform: `translate3d(${translateX}px, 0, 0)` }}
              >
                {row.left.map((brand, idx) => (
                  <BrandPill key={`l-${row.label}-${idx}`} brand={brand} />
                ))}

                <span className="inline-block overflow-hidden px-3 py-1">
                  <span
                    className={cn(
                      "inline-block text-center text-[clamp(2rem,3.6vw,3.25rem)] leading-none font-bold tracking-[-0.03em] whitespace-nowrap text-[#1e1e1e] transition-all duration-700 ease-out",
                      inView
                        ? "translate-y-0 opacity-100"
                        : "translate-y-full opacity-0",
                    )}
                    style={{ transitionDelay: `${row.revealDelayMs}ms` }}
                  >
                    {row.label}
                  </span>
                </span>

                {row.right.map((brand, idx) => (
                  <BrandPill key={`r-${row.label}-${idx}`} brand={brand} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Scroll-Linked Rows (3 compact rows, ~3 pills visible per row) */}
      <div className="space-y-3 overflow-hidden md:hidden">
        {SCROLL_ROWS.map((row) => {
          const translateX = delta * 0.45 * row.direction;
          return (
            <div key={`m-${row.label}`} className="flex justify-center">
              <div
                className="flex items-center gap-2.5 will-change-transform"
                style={{ transform: `translate3d(${translateX}px, 0, 0)` }}
              >
                {[...row.left, ...row.right].map((brand, idx) => (
                  <BrandPill key={`m-${row.label}-${idx}`} brand={brand} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Supporting Copy */}
      <div
        className={cn(
          "mx-auto mt-12 max-w-2xl px-6 text-center text-sm leading-relaxed text-[#4D4D48] transition-all duration-700 ease-out sm:mt-16 sm:text-base",
          inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        )}
        style={{ transitionDelay: "320ms" }}
      >
        <p>
          Khách hàng là nguồn động lực lớn để chúng tôi luôn phấn đấu đạt đến sự
          hoàn hảo. Từ các tập đoàn bán lẻ, ngân hàng đến những thương hiệu thời
          trang cao cấp — tiêu chuẩn của Khang Việt luôn không đổi: thẩm mỹ sắc
          nét và thi công chuẩn xác.
        </p>
      </div>
    </div>
  );
};

export default TrustedClientsSection;
