"use client";

import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);

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
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
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

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (allClusters.length === 0) return null;

  return (
    <>
      {/* Desktop Floating Expandable Rail (bên phải màn hình) */}
      <aside
        aria-label="Mục lục nhảy nhanh"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className="fixed top-1/2 right-4 z-40 hidden -translate-y-1/2 lg:block xl:right-6"
      >
        <div
          className={`overflow-hidden rounded-2xl border border-white/10 bg-[#181715]/95 text-white shadow-2xl backdrop-blur-md transition-all duration-300 ease-out ${
            isExpanded ? "w-72 p-3" : "w-11 px-2 py-3"
          }`}
        >
          {/* Header khi mở rộng */}
          <div
            className={`overflow-hidden transition-all duration-200 ${
              isExpanded ? "mb-2.5 max-h-6 px-2 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <span className="font-mono text-[10px] font-semibold tracking-[0.16em] text-white/50 uppercase">
              Mục lục nhảy nhanh
            </span>
          </div>

          {/* Phần 01: Đối tác (Chấm tròn) */}
          <div className="space-y-1">
            {partnerClusters.map((cluster) => {
              const isActive = activeId === cluster.config.id;
              const accent = cluster.config.accentColor ?? "#F58633";

              return (
                <button
                  key={cluster.config.id}
                  type="button"
                  onClick={() => handleJump(cluster.config.id)}
                  title={cluster.config.title}
                  className={`flex w-full cursor-pointer items-center justify-end gap-2.5 rounded-lg py-1.5 transition-colors ${
                    isExpanded ? "px-2" : "justify-center px-0"
                  } ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:bg-white/6 hover:text-white"
                  }`}
                >
                  {isExpanded && (
                    <div className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right">
                      <span className="font-mono text-[10px] text-white/40">
                        01
                      </span>
                      <span className="truncate text-xs font-medium">
                        {cluster.config.title}
                      </span>
                      <span className="font-mono text-[10px] text-white/40 tabular-nums">
                        ({cluster.projects.length})
                      </span>
                    </div>
                  )}

                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full transition-all ${
                      isActive ? "outline-2 outline-offset-2 outline-white/55" : ""
                    }`}
                    style={{ backgroundColor: accent }}
                  />
                </button>
              );
            })}
          </div>

          {/* Đường kẻ phân tách Phần 01 & Phần 02 */}
          <div className="my-2 border-t border-white/12" />

          {/* Phần 02: Giải pháp kỹ thuật (Vuông bo góc) */}
          <div className="space-y-1">
            {solutionClusters.map((cluster) => {
              const isActive = activeId === cluster.config.id;
              const accent = cluster.config.accentColor ?? "#F58633";

              return (
                <button
                  key={cluster.config.id}
                  type="button"
                  onClick={() => handleJump(cluster.config.id)}
                  title={cluster.config.title}
                  className={`flex w-full cursor-pointer items-center justify-end gap-2.5 rounded-lg py-1.5 transition-colors ${
                    isExpanded ? "px-2" : "justify-center px-0"
                  } ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:bg-white/6 hover:text-white"
                  }`}
                >
                  {isExpanded && (
                    <div className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right">
                      <span className="font-mono text-[10px] text-white/40">
                        02
                      </span>
                      <span className="truncate text-xs font-medium">
                        {cluster.config.title}
                      </span>
                    </div>
                  )}

                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-[3px] transition-all ${
                      isActive ? "outline-2 outline-offset-2 outline-white/55" : ""
                    }`}
                    style={{ backgroundColor: accent }}
                  />
                </button>
              );
            })}
          </div>

          {/* Lên đầu trang */}
          <div className="mt-2 border-t border-white/12 pt-2">
            <button
              type="button"
              onClick={handleScrollTop}
              title="Lên đầu trang"
              className={`flex w-full cursor-pointer items-center gap-2 rounded-lg py-1.5 text-white/65 transition-colors hover:bg-white/6 hover:text-white ${
                isExpanded ? "justify-end px-2" : "justify-center px-0"
              }`}
            >
              {isExpanded && (
                <span className="font-mono text-[11px]">Lên đầu trang</span>
              )}
              <ArrowUp className="h-3.5 w-3.5 shrink-0" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Compact Sticky Strip */}
      <nav
        aria-label="Mục lục câu chuyện dự án"
        className="sticky top-20 z-30 border-b border-black/8 bg-[#faf9f6]/92 backdrop-blur-md lg:hidden"
      >
        <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-5 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {allClusters.map((cluster) => {
            const isActive = activeId === cluster.config.id;
            const accent = cluster.config.accentColor ?? "#F58633";
            return (
              <button
                key={cluster.config.id}
                type="button"
                onClick={() => handleJump(cluster.config.id)}
                className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                  isActive
                    ? "border-[#1a1918] bg-[#1a1918] text-white"
                    : "border-black/10 bg-white text-[#1a1918]/80"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 shrink-0 ${
                    cluster.config.groupType === "partner"
                      ? "rounded-full"
                      : "rounded-[2px]"
                  }`}
                  style={{ backgroundColor: isActive ? "#ffffff" : accent }}
                />
                <span>{cluster.config.title}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default ChapterScrollRail;
