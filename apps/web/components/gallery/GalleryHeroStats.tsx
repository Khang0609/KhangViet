import React from "react";
import type { GalleryStats } from "@khangviet/types";

interface GalleryHeroStatsProps {
  stats?: GalleryStats;
}

export const GalleryHeroStats: React.FC<GalleryHeroStatsProps> = ({ stats }) => {
  const totalLabel = stats?.totalProjectsLabel ?? "1,000+";
  const brandsLabel = stats?.b2bBrandsLabel ?? "45+";

  return (
    <section className="border-b border-black/8 bg-[#f4f1ea] pt-28 pb-8 sm:pt-32 sm:pb-10">
      <div className="mx-auto max-w-360 px-5 md:px-8 xl:px-12">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.14em] text-(--accent-bronze) uppercase">
              Kho dự án & Hồ sơ năng lực
            </p>
            <h1 className="mt-2.5 text-3xl leading-tight font-semibold tracking-tight text-[#1a1918] sm:text-4xl">
              Công Trình Thực Tế &amp; Hồ Sơ Trúng Thầu.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#625f5a]">
              Tra cứu trực quan các dự án đã nghiệm thu thực tế và phối cảnh
              2D/3D trúng thầu của Khang Việt — từ chuỗi đối tác B2B đến khách
              hàng doanh nghiệp lẻ.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 border-t border-black/8 pt-5 sm:gap-10 lg:border-t-0 lg:pt-0">
            <div>
              <div className="text-2xl font-semibold text-[#1a1918] tabular-nums sm:text-3xl">
                {totalLabel.replace("+", "")}
                <span className="text-(--accent-bronze)">+</span>
              </div>
              <div className="mt-1 text-xs text-[#625f5a]">
                Công trình toàn quốc
              </div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-[#1a1918] tabular-nums sm:text-3xl">
                {brandsLabel.replace("+", "")}
                <span className="text-(--accent-bronze)">+</span>
              </div>
              <div className="mt-1 text-xs text-[#625f5a]">
                Thương hiệu chuỗi B2B
              </div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-[#1a1918] tabular-nums sm:text-3xl">
                100<span className="text-(--accent-bronze)">%</span>
              </div>
              <div className="mt-1 text-xs text-[#625f5a]">
                Tự chủ xưởng Bình Tân
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GalleryHeroStats;
