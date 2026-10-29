import React from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import type { HeroSlide } from "@khangviet/types";
import TechBadge from "../ui/TechBadge";
import { HeroCarouselVisual } from "./HeroCarouselVisual";

export const STATS = [
  { value: "15+", label: "Năm kinh nghiệm", note: "2009 — Nay" },
  { value: "1,000+", label: "Công trình hoàn thiện", note: "Trên toàn quốc" },
  { value: "100%", label: "Tự chủ sản xuất", note: "Cơ khí & In ấn" },
];

export interface HeroSectionProps {
  slides?: HeroSlide[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({ slides }) => {
  return (
    <section className="bg-blueprint-grid relative overflow-hidden border-b border-white/8 pt-20">
      <div className="pointer-events-none absolute top-32 -left-40 h-96 w-96 rounded-full bg-(--accent-bronze)/5 blur-[120px]" />
      <div className="mx-auto max-w-360 px-5 pt-16 pb-16 md:px-8 md:pt-24 md:pb-20 xl:px-12 xl:pt-28">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <div className="mb-7">
              <TechBadge variant="line">
                Since 2009 • Architectural signage & interior
              </TechBadge>
            </div>
            <h1 className="font-display text-[clamp(2.75rem,5.4vw,5rem)] leading-[0.98]">
              Kiến Tạo
              <br />
              Diện Mạo
              <br />
              <span className="text-(--accent-bronze)">Thương Hiệu</span>
              <br />
              Đỉnh Cao.
            </h1>
            <p className="mt-7 max-w-xl text-sm leading-7 text-(--text-secondary) md:text-base">
              Hơn 15 năm đồng hành cùng các tập đoàn hàng đầu, kiến tạo không
              gian kinh doanh và hệ thống nhận diện biển hiệu chuẩn mực — từ bản
              vẽ kỹ thuật đến công trình hoàn thiện.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#du-an"
                className="group flex items-center gap-3 bg-(--accent-bronze) px-5 py-3.5 text-xs font-bold tracking-[0.12em] text-(--bg-obsidian) uppercase transition-colors hover:bg-(--accent-bronze-light)"
              >
                Khám phá dự án
                <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-1" />
              </a>
              <a
                href="#contact-gate"
                className="flex items-center gap-3 border border-white/15 px-5 py-3.5 text-xs font-semibold tracking-[0.12em] uppercase transition-colors hover:border-(--accent-bronze) hover:text-(--accent-bronze)"
              >
                Nhận tư vấn kỹ thuật
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <HeroCarouselVisual slides={slides} />
        </div>

        <div className="mt-16 grid border-y border-white/8 sm:grid-cols-3 lg:mt-20 lg:ml-[42%]">
          {STATS.map((stat, index) => (
            <div
              key={stat.label}
              className={`px-5 py-6 ${index ? "border-t border-white/8 sm:border-t-0 sm:border-l" : ""}`}
            >
              <div className="font-syne text-3xl font-bold text-(--accent-bronze) md:text-4xl">
                {stat.value}
              </div>
              <div className="mt-2 text-xs font-semibold tracking-wide uppercase">
                {stat.label}
              </div>
              <div className="font-mono-tech mt-1 text-[9px] tracking-wider text-(--text-secondary) uppercase">
                {stat.note}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
