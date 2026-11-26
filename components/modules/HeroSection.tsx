import React from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import type { HeroSlide } from "@khangviet/types";
import { HeroCarouselVisual } from "./HeroCarouselVisual";

export interface HeroSectionProps {
  slides?: HeroSlide[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({ slides }) => {
  return (
    <section className="relative overflow-hidden border-b border-black/8 bg-[#f4f1ea] pt-20">
      <div className="mx-auto max-w-360 px-5 pt-12 pb-16 md:px-8 md:pt-18 md:pb-24 xl:px-12 xl:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <p className="text-xs font-medium tracking-[0.12em] text-[#625f5a] uppercase">
              Từ 2009 · Thiết kế &amp; Thi công Thương mại
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
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <a
                href="#du-an"
                className="group inline-flex items-center gap-2.5 rounded-full bg-[#1a1918] px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-(--accent-bronze)"
              >
                Khám phá dự án
                <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              </a>
              <a
                href="#contact-gate"
                className="group inline-flex items-center gap-1.5 py-3 text-sm font-medium text-[#1a1918] transition-colors hover:text-(--accent-bronze)"
              >
                Nhận tư vấn
                <ArrowUpRight className="h-4 w-4 text-(--accent-bronze) transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>

          <HeroCarouselVisual slides={slides} />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
