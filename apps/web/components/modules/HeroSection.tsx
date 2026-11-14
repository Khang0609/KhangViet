import React from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import type { HeroSlide } from "@khangviet/types";
import { HeroCarouselVisual } from "./HeroCarouselVisual";

export const STATS = [
  { value: "15+", label: "Năm kinh nghiệm", note: "2009 — Nay" },
  { value: "1,000+", label: "Công trình hoàn thiện", note: "Trên toàn quốc" },
  { value: "100%", label: "Tự chủ sản xuất", note: "Xưởng cơ khí & in ấn" },
];

export interface HeroSectionProps {
  slides?: HeroSlide[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({ slides }) => {
  return (
    <section className="relative overflow-hidden border-b border-black/8 bg-[#f4f1ea] pt-20">
      <div className="mx-auto max-w-360 px-5 pt-12 pb-14 md:px-8 md:pt-18 md:pb-18 xl:px-12 xl:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <p className="text-xs font-medium tracking-[0.14em] text-[#625f5a] uppercase">
              Since 2009 • Architectural Signage & Interior
            </p>
            <h1 className="mt-5 text-[clamp(2.35rem,4.1vw,3.9rem)] leading-[1.08] font-semibold tracking-tight text-[#1a1918]">
              Kiến Tạo Diện Mạo{" "}
              <span className="whitespace-nowrap text-(--accent-bronze)">
                Thương Hiệu
              </span>{" "}
              Đỉnh Cao.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-[#625f5a]">
              Hơn 15 năm đồng hành cùng các tập đoàn hàng đầu, thiết kế và thi
              công trọn gói hệ thống biển hiệu, mặt dựng và không gian kinh
              doanh chuẩn mực.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#du-an"
                className="group inline-flex items-center gap-2.5 rounded-full bg-[#1a1918] px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-(--accent-bronze)"
              >
                Khám phá dự án
                <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              </a>
              <a
                href="#contact-gate"
                className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white/70 px-6 py-3.5 text-sm font-medium text-[#1a1918] transition-colors hover:border-[#1a1918] hover:bg-white"
              >
                Nhận tư vấn
                <ArrowUpRight className="h-4 w-4 text-(--accent-bronze)" />
              </a>
            </div>
          </div>

          <HeroCarouselVisual slides={slides} />
        </div>

        <div className="mt-14 grid border-t border-black/10 pt-8 sm:grid-cols-3 lg:mt-16">
          {STATS.map((stat, index) => (
            <div
              key={stat.label}
              className={`py-4 sm:px-6 ${index ? "border-t border-black/10 sm:border-t-0 sm:border-l" : "sm:pl-0"}`}
            >
              <div className="text-3xl font-semibold tracking-tight text-[#1a1918] md:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1.5 text-sm font-medium text-[#1a1918]">
                {stat.label}
              </div>
              <div className="mt-0.5 text-xs text-[#625f5a]">{stat.note}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
