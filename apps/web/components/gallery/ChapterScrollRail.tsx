"use client";

import React, { useEffect, useState } from "react";
import type { ResolvedGalleryCluster } from "@/lib/galleryClusters";

interface ChapterScrollRailProps {
  partnerClusters: ResolvedGalleryCluster[];
  solutionClusters: ResolvedGalleryCluster[];
}

export const ChapterScrollRail: React.FC<ChapterScrollRailProps> = ({
  partnerClusters,
  solutionClusters,
}) => {
  const allClusters = [...partnerClusters, ...solutionClusters];
  const [activeId, setActiveId] = useState<string>(
    allClusters[0]?.config.id ?? ""
  );

  useEffect(() => {
    if (allClusters.length === 0) return;

    const elements = allClusters
      .map((c) => document.getElementById(c.config.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top
          );
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-140px 0px -55% 0px",
        threshold: 0.05,
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [allClusters.length]);

  const handleJump = (id: string) => {
    setActiveId(id);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (allClusters.length === 0) return null;

  return (
    <nav
      aria-label="Mục lục câu chuyện dự án"
      className="sticky top-20 z-30 border-b border-black/8 bg-[#faf9f6]/92 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-360 items-center gap-3 overflow-x-auto px-5 py-3 [scrollbar-width:none] md:px-8 xl:px-12 [&::-webkit-scrollbar]:hidden">
        {/* Phần 1: Đối tác */}
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="mr-1 text-[10px] font-semibold tracking-[0.14em] text-[#625f5a] uppercase">
            01 · Đối tác
          </span>
          {partnerClusters.map((cluster) => {
            const isActive = activeId === cluster.config.id;
            const accent = cluster.config.accentColor ?? "#F58633";
            return (
              <button
                key={cluster.config.id}
                type="button"
                onClick={() => handleJump(cluster.config.id)}
                className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "border-[#1a1918] bg-[#1a1918] text-white shadow-xs"
                    : "border-black/10 bg-white text-[#1a1918]/80 hover:border-black/25 hover:text-[#1a1918]"
                }`}
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: isActive ? "#ffffff" : accent }}
                />
                <span>{cluster.config.title}</span>
              </button>
            );
          })}
        </div>

        <span
          className="h-4 w-px shrink-0 bg-black/15"
          aria-hidden="true"
        />

        {/* Phần 2: Giải pháp kỹ thuật */}
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="mr-1 text-[10px] font-semibold tracking-[0.14em] text-(--accent-bronze) uppercase">
            02 · Giải pháp
          </span>
          {solutionClusters.map((cluster) => {
            const isActive = activeId === cluster.config.id;
            return (
              <button
                key={cluster.config.id}
                type="button"
                onClick={() => handleJump(cluster.config.id)}
                className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "border-(--accent-bronze) bg-(--accent-bronze) text-white shadow-xs"
                    : "border-black/10 bg-white text-[#1a1918]/80 hover:border-(--accent-bronze)/60 hover:text-[#1a1918]"
                }`}
              >
                <span>{cluster.config.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default ChapterScrollRail;
