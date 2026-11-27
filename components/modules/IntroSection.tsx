import React from "react";
import Link from "next/link";
import { RevealOnView } from "@/ui/RevealOnView";
import { PartnerSection } from "./PartnerSection";
import { TrustedClientsSection } from "./TrustedClientsSection";

const HEADLINE_LINES = [
  "Từ năm 2009, đồng hành",
  "nâng tầm diện mạo thương hiệu.",
];

export const IntroSection: React.FC = () => {
  return (
    <section id="gioi-thieu" className="bg-white px-3 pb-3 sm:px-4 sm:pb-4">
      <div className="relative overflow-hidden rounded-(--radius-frame) bg-[#F7F4E6] px-3 pt-20 pb-8 sm:px-12 sm:pt-32 sm:pb-12 md:pt-36 md:pb-16">
        {/* Drifting Grayscale Logo-Mark Watermark (2 GPU CSS layers instead of 784 SVG DOM nodes) */}
        <div
          className="pointer-events-none absolute -inset-96 -rotate-12 select-none"
          style={{
            maskImage:
              "linear-gradient(to bottom, black 0%, black 55%, transparent 78%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 55%, transparent 78%)",
          }}
          aria-hidden="true"
        >
          <div className="animate-watermark-left watermark-tile-even absolute -inset-x-96 inset-y-0" />
          <div className="animate-watermark-right watermark-tile-odd absolute -inset-x-96 inset-y-0" />
        </div>

        {/* Centered Editorial Copy (Pre-rendered in HTML; reveal isolated to RevealOnView) */}
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h2 className="text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.08] font-bold tracking-[-0.03em] text-[#1e1e1e]">
            {HEADLINE_LINES.map((line, idx) => (
              <RevealOnView key={line} delayMs={idx * 110}>
                <span className="block pb-1">{line}</span>
              </RevealOnView>
            ))}
          </h2>

          <RevealOnView
            delayMs={240}
            className="mx-auto mt-8 max-w-2xl space-y-5 text-sm leading-relaxed text-[#4D4D48] sm:text-base"
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
          </RevealOnView>

          <RevealOnView delayMs={360} className="mt-9 flex justify-center">
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-lg bg-brand px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand/90"
            >
              Khang Việt là ai?
            </Link>
          </RevealOnView>
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
