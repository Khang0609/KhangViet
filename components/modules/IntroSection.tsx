"use client";

import React from "react";
import Link from "next/link";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/ultis";
import { PartnerSection } from "./PartnerSection";
import { TrustedClientsSection } from "./TrustedClientsSection";

const HEADLINE_LINES = [
  "Từ năm 2009, đồng hành",
  "nâng tầm diện mạo thương hiệu.",
];

/**
 * Monochrome inline SVG of Khang Việt's geometric square+beacon mark (no text)
 * used as a subtle drifting watermark pattern.
 */
function GrayscaleLogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-24 w-24 shrink-0 sm:h-28 sm:w-28", className)}
      aria-hidden="true"
    >
      <path d="M4 4H60V60L4 4Z" fill="#1E1E1E" fillOpacity="0.045" />
      <path d="M4 4V60H60L4 4Z" fill="#1E1E1E" fillOpacity="0.08" />
      <circle cx="32" cy="32" r="14" fill="#F7F4E6" />
      <circle cx="32" cy="32" r="7" fill="#1E1E1E" fillOpacity="0.08" />
    </svg>
  );
}

const WATERMARK_ROWS = Array.from({ length: 14 }, (_, i) => i);
const WATERMARK_ITEMS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export const IntroSection: React.FC = () => {
  const { ref, inView } = useInView(0.2);

  return (
    <section id="gioi-thieu" className="bg-white px-3 pb-3 sm:px-4 sm:pb-4">
      <div
        ref={ref}
        className="relative overflow-hidden rounded-(--radius-frame) bg-[#F7F4E6] px-6 pt-24 pb-8 sm:px-12 sm:pt-32 sm:pb-12 md:pt-36 md:pb-16"
      >
        {/* Drifting Grayscale Logo-Mark Watermark */}
        <div
          className="pointer-events-none absolute -inset-24 flex -rotate-12 flex-col justify-start gap-10 select-none"
          style={{
            maskImage:
              "linear-gradient(to bottom, black 0%, black 55%, transparent 78%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 55%, transparent 78%)",
          }}
          aria-hidden="true"
        >
          {WATERMARK_ROWS.map((row) => (
            <div
              key={row}
              className={cn(
                "flex items-center gap-12",
                row % 2 === 0
                  ? "animate-watermark-left"
                  : "animate-watermark-right",
              )}
            >
              {WATERMARK_ITEMS.map((item) => (
                <GrayscaleLogoMark
                  key={`${row}-${item}`}
                  className={cn(item % 2 === 0 ? "rotate-6" : "-rotate-6")}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Centered Editorial Copy */}
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h2 className="text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.08] font-bold tracking-[-0.03em] text-[#1e1e1e]">
            {HEADLINE_LINES.map((line, idx) => (
              <span key={line} className="block overflow-hidden pb-1">
                <span
                  className={cn(
                    "block transition-all duration-700 ease-out",
                    inView
                      ? "translate-y-0 opacity-100"
                      : "translate-y-full opacity-0",
                  )}
                  style={{ transitionDelay: `${idx * 110}ms` }}
                >
                  {line}
                </span>
              </span>
            ))}
          </h2>

          <div
            className={cn(
              "mx-auto mt-8 max-w-2xl space-y-5 text-sm leading-relaxed text-[#4D4D48] transition-all duration-700 ease-out sm:text-base",
              inView ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
            )}
            style={{ transitionDelay: "240ms" }}
          >
            <p>
              Thành lập từ năm 2009, Khang Việt không ngừng đầu tư con người,
              máy móc, thiết bị và vật tư cho ngành quảng cáo và trang trí nội
              thất — trực tiếp từ khảo sát, thiết kế đến sản xuất tại xưởng.
            </p>
            <p>
              Với phương châm Uy tín – Trách nhiệm – Tận tâm, chúng tôi tự hào
              đồng hành cùng VinGroup, Vincom, Kingsmen, BIDV, Eximbank, GO! và
              nhiều nhãn hàng hàng đầu.
            </p>
          </div>

          <div
            className={cn(
              "mt-9 flex justify-center transition-all duration-700 ease-out",
              inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            )}
            style={{ transitionDelay: "360ms" }}
          >
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-lg bg-[#C93818] px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#AE2E12]"
            >
              Khang Việt là ai?
            </Link>
          </div>
        </div>

        {/* Dark Partner / Services Bridge Card */}
        <PartnerSection />

        {/* Trusted Clients Split Marquee */}
        <TrustedClientsSection />
      </div>
    </section>
  );
};

export default IntroSection;
