import React from "react";
import type { GalleryStats } from "@khangviet/types";

interface GalleryHeroStatsProps {
  stats?: GalleryStats;
}

export const GalleryHeroStats: React.FC<GalleryHeroStatsProps> = ({ stats }) => {
  const totalLabel = stats?.totalProjectsLabel ?? "1,000+";
  const brandsLabel = stats?.b2bBrandsLabel ?? "45+";

  return (
    <section className="border-b border-white/8 bg-linear-to-b from-zinc-900/50 to-(--bg-obsidian) pt-28 pb-8 sm:pt-30 sm:pb-10">
      <div className="mx-auto max-w-360 px-5 md:px-8 xl:px-12">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-brand uppercase">
              <span className="h-2 w-2 rounded-full bg-brand" />
              Project Catalog • Danh mục công trình toàn diện
            </div>
            <h1 className="text-2xl leading-tight font-extrabold tracking-tight text-white sm:text-4xl">
              Kho Dữ Liệu Công Trình &amp; Hồ Sơ Trúng Thầu.
            </h1>
            <p className="mt-2.5 text-sm leading-relaxed text-zinc-400">
              Tra cứu trực quan toàn bộ dự án đã nghiệm thu thực tế và các gói
              phối cảnh 2D/3D trúng thầu của Khang Việt — phân tách rõ giữa{" "}
              <strong className="text-zinc-200">Chuỗi đối tác B2B</strong> và{" "}
              <strong className="text-zinc-200">
                Khách hàng doanh nghiệp lẻ (C2B)
              </strong>
              .
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-white/8 pt-4 sm:gap-8 lg:border-t-0 lg:pt-0">
            <div>
              <div className="text-xl font-extrabold text-white sm:text-2xl">
                {totalLabel.replace("+", "")}
                <span className="text-brand">+</span>
              </div>
              <div className="mt-0.5 text-[11px] text-zinc-400">
                Công trình toàn quốc
              </div>
            </div>
            <div>
              <div className="text-xl font-extrabold text-white sm:text-2xl">
                {brandsLabel.replace("+", "")}
                <span className="text-brand">+</span>
              </div>
              <div className="mt-0.5 text-[11px] text-zinc-400">
                Thương hiệu chuỗi B2B
              </div>
            </div>
            <div>
              <div className="text-xl font-extrabold text-white sm:text-2xl">
                100<span className="text-brand">%</span>
              </div>
              <div className="mt-0.5 text-[11px] text-zinc-400">
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
