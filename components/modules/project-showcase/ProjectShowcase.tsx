"use client";

import React from "react";
import Link from "next/link";
import type { Project } from "@/types/landing";
import { useFeaturedProjects } from "@/components/contexts/LandingContext";
import { useModalContext } from "@/components/modals/modalContext";
import { useInView } from "@/hooks/useInView";
import { useInfiniteCarousel } from "@/hooks/useInfiniteCarousel";
import { cn } from "@/lib/ultis";

export interface ProjectShowcaseProps {
  projects?: Project[];
  onSelectProject?: (project: Project, imageIndex?: number) => void;
}

const HEADING_LINES = ["Những công trình", "tự nói lên chất lượng."];

function ProjectCarouselCard({
  project,
  onSelect,
}: {
  project: Project;
  onSelect: (project: Project) => void;
}) {
  const coverSrc =
    project.media.find((m) => m.isCover)?.storageKey ??
    project.media[0]?.storageKey ??
    "/image/image-placeholder.png";
  const clientName = project.organization?.name ?? "Khang Việt";

  return (
    <button
      type="button"
      onClick={() => onSelect(project)}
      className="group relative flex aspect-3/4 w-78 shrink-0 snap-center cursor-pointer flex-col justify-between overflow-hidden rounded-3xl bg-[#181816] p-7 text-left select-none sm:w-88 lg:w-96"
    >
      <img
        src={coverSrc}
        alt={project.title}
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />

      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-black/30 transition-opacity duration-300 group-hover:opacity-90" />

      <div className="relative z-10 mt-auto mb-auto pt-8">
        <span className="inline-block text-xs font-semibold tracking-wider text-white/90 uppercase">
          {clientName}
        </span>
        <h3 className="mt-2.5 line-clamp-3 text-2xl leading-[1.15] font-bold tracking-[-0.02em] text-white sm:text-[1.7rem]">
          {project.title}
        </h3>
      </div>

      <div className="relative z-10 flex justify-end">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/55 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm transition-colors duration-200 group-hover:border-[#C93818] group-hover:bg-[#C93818]">
          Xem chi tiết
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </button>
  );
}

export const ProjectShowcase: React.FC<ProjectShowcaseProps> = ({
  projects,
  onSelectProject,
}) => {
  const contextProjects = useFeaturedProjects();
  const { openProjectModal } = useModalContext();
  const { ref, inView } = useInView(0.2);

  const activeProjects =
    projects && projects.length > 0 ? projects : contextProjects;

  // Ensure each of the 3 loop sets is wider than any desktop viewport (>= 8 cards)
  const repeatCount = Math.max(1, Math.ceil(8 / Math.max(1, activeProjects.length)));
  const oneSetProjects = Array.from({ length: repeatCount }, () => activeProjects).flat();

  const {
    scrollerRef,
    isDragging,
    handleScroll,
    onPointerDown,
    onPointerMove,
    onPointerEnd,
    shouldPreventClick,
  } = useInfiniteCarousel(oneSetProjects.length);

  const handleSelect = (project: Project) => {
    if (shouldPreventClick()) return;
    if (onSelectProject) {
      onSelectProject(project, 0);
      return;
    }
    openProjectModal(project, 0);
  };

  return (
    <section
      id="du-an"
      ref={ref}
      className="relative w-full scroll-mt-20 overflow-hidden bg-[#222220] text-[#F7F4E6]"
    >
      {/* Subtle Wavy Top Edge */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-3 w-full overflow-hidden"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1200 12"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <path
            d="M0 0 H1200 V4 Q1170 11 1140 4 T1080 4 T1020 4 T960 4 T900 4 T840 4 T780 4 T720 4 T660 4 T600 4 T540 4 T480 4 T420 4 T360 4 T300 4 T240 4 T180 4 T120 4 T60 4 T0 4 Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>

      {/* Split Header */}
      <div className="mx-auto max-w-6xl px-6 pt-20 pb-12 sm:px-10 sm:pt-28 sm:pb-16">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <h2 className="text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[1.06] font-bold tracking-[-0.03em] text-white">
              {HEADING_LINES.map((line, idx) => (
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
          </div>

          <div
            className={cn(
              "transition-all duration-700 ease-out lg:col-span-6",
              inView ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
            )}
            style={{ transitionDelay: "200ms" }}
          >
            <p className="max-w-lg text-sm leading-relaxed text-[#D6D3C9] sm:text-base">
              Những dự án Khang Việt trực tiếp khảo sát, thiết kế và thi công
              trọn gói — từ mặt tiền showroom, hệ thống bảng hiệu ngân hàng
              đến không gian siêu thị và trung tâm thương mại.
            </p>

            <Link
              href="/projects"
              className="mt-5 inline-flex items-center gap-2 border-b border-white/70 pb-1 text-sm font-semibold text-white transition-colors duration-200 hover:border-[#F58633] hover:text-[#F58633]"
            >
              Xem tất cả công trình
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* User-Scrollable Infinite Loop Carousel (drag or Shift+scroll) */}
      <div
        className={cn(
          "pb-16 transition-all duration-700 ease-out sm:pb-24",
          inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
        )}
        style={{ transitionDelay: "280ms" }}
      >
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerLeave={onPointerEnd}
          onPointerCancel={onPointerEnd}
          className={cn(
            "no-scrollbar flex w-full cursor-grab overflow-x-auto active:cursor-grabbing",
            !isDragging && "snap-x snap-mandatory",
          )}
        >
          {[0, 1, 2].map((copy) => (
            <div
              key={copy}
              className="flex shrink-0 items-stretch gap-5 pr-5 sm:gap-6 sm:pr-6"
            >
              {oneSetProjects.map((project, idx) => (
                <ProjectCarouselCard
                  key={`${copy}-${project.id}-${idx}`}
                  project={project}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectShowcase;
