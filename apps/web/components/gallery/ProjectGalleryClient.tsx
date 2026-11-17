"use client";

import React, { useMemo } from "react";
import type { ProjectGalleryResponse } from "@khangviet/types";
import { resolveGalleryClusters } from "@/lib/galleryClusters";
import { GalleryHeroStats } from "./GalleryHeroStats";
import { ChapterScrollRail } from "./ChapterScrollRail";
import { BentoClusterSection } from "./BentoClusterSection";

interface ProjectGalleryClientProps {
  data: ProjectGalleryResponse;
}

export const ProjectGalleryClient: React.FC<ProjectGalleryClientProps> = ({
  data,
}) => {
  const { partnerClusters, solutionClusters } = useMemo(
    () => resolveGalleryClusters(data),
    [data]
  );

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1a1918]">
      <GalleryHeroStats stats={data.stats} />

      <ChapterScrollRail
        partnerClusters={partnerClusters}
        solutionClusters={solutionClusters}
      />

      <main>
        {/* Phần 1: Cụm Bento Đối tác chiến lược */}
        <div className="border-b border-black/8 bg-[#faf9f6] py-8 sm:py-10">
          <div className="mx-auto flex max-w-360 flex-col justify-between gap-3 px-5 md:flex-row md:items-end md:px-8 xl:px-12">
            <div>
              <span className="text-[11px] font-semibold tracking-[0.16em] text-(--accent-bronze) uppercase">
                Phần 01 · Nền tảng uy tín B2B
              </span>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#1a1918] sm:text-2xl">
                Dấu Ấn Cùng Các Đối Tác Chiến Lược
              </h2>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-[#625f5a]">
              Ưu tiên trình diễn năng lực đồng hành lâu dài cùng các tập đoàn,
              ngân hàng và hệ thống bán lẻ quy mô toàn quốc.
            </p>
          </div>
        </div>

        {partnerClusters.map((cluster, index) => (
          <BentoClusterSection
            key={cluster.config.id}
            cluster={cluster}
            chapterNumber={index + 1}
          />
        ))}

        {/* Dải chuyển hồi sang Phần 2: Giải pháp kỹ thuật */}
        <div className="border-b border-black/10 bg-[#181715] py-12 text-white sm:py-14">
          <div className="mx-auto flex max-w-360 flex-col justify-between gap-4 px-5 md:flex-row md:items-end md:px-8 xl:px-12">
            <div>
              <span className="text-[11px] font-semibold tracking-[0.16em] text-(--accent-bronze) uppercase">
                Phần 02 · Chuyên sâu kỹ thuật &amp; Khách hàng doanh nghiệp lẻ
              </span>
              <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Giải Pháp Thi Công Theo Hạng Mục
              </h2>
            </div>
            <p className="max-w-lg text-sm leading-relaxed text-white/70">
              Tổng hợp toàn bộ công trình theo từng năng lực sản xuất trực tiếp tại
              xưởng: từ bảng hiệu mặt dựng, hộp đèn chữ nổi đến nội thất quầy kệ và
              mỹ thuật không gian.
            </p>
          </div>
        </div>

        {solutionClusters.map((cluster, index) => (
          <BentoClusterSection
            key={cluster.config.id}
            cluster={cluster}
            chapterNumber={partnerClusters.length + index + 1}
          />
        ))}
      </main>
    </div>
  );
};

export default ProjectGalleryClient;
