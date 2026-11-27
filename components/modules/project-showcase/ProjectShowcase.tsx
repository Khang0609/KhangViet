"use client";

import React, { useState } from "react";
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

interface ProjectTheme {
  sectionBgLg: string;
  textPrimaryLg: string;
  textMutedLg: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  cardBg: string;
  controlBorder: string;
}

function getProjectTheme(project?: Project): ProjectTheme {
  const key = `${project?.id ?? ""} ${project?.slug ?? ""} ${project?.title ?? ""}`.toLowerCase();

  if (key.includes("bidv")) {
    return {
      sectionBgLg: "lg:bg-[#E4F2EC]",
      textPrimaryLg: "lg:text-[#0D281D]",
      textMutedLg: "lg:text-[#2E5242]",
      accentBg: "bg-[#C59B27]",
      accentText: "text-[#8F6B0B]",
      accentBorder: "border-[#C59B27]/35",
      cardBg: "bg-white/80",
      controlBorder: "border-[#0D281D]/15 hover:border-[#C59B27]",
    };
  }

  if (key.includes("bigc") || key.includes("go!")) {
    return {
      sectionBgLg: "lg:bg-[#EDF6DA]",
      textPrimaryLg: "lg:text-[#1B2810]",
      textMutedLg: "lg:text-[#445932]",
      accentBg: "bg-[#D9232A]",
      accentText: "text-[#D9232A]",
      accentBorder: "border-[#D9232A]/30",
      cardBg: "bg-white/80",
      controlBorder: "border-[#1B2810]/15 hover:border-[#D9232A]",
    };
  }

  return {
    sectionBgLg: "lg:bg-[#222220]",
    textPrimaryLg: "lg:text-[#F7F4E6]",
    textMutedLg: "lg:text-[#D6D3C9]",
    accentBg: "bg-[#C93818]",
    accentText: "text-[#F58633]",
    accentBorder: "border-white/20",
    cardBg: "bg-white/8",
    controlBorder: "border-white/20 hover:border-[#F58633]",
  };
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
      className="group relative flex aspect-3/4 w-78 shrink-0 snap-center cursor-pointer flex-col justify-between overflow-hidden rounded-3xl bg-[#181816] p-7 text-left select-none sm:w-88"
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

  const [activeIndex, setActiveIndex] = useState(0);

  const activeProjects =
    projects && projects.length > 0 ? projects : contextProjects;
  const safeIndex =
    activeProjects.length > 0 ? activeIndex % activeProjects.length : 0;
  const currentProject = activeProjects[safeIndex];
  const theme = getProjectTheme(currentProject);

  // Mobile carousel infinite loop setup
  const repeatCount = Math.max(
    1,
    Math.ceil(8 / Math.max(1, activeProjects.length)),
  );
  const oneSetProjects = Array.from(
    { length: repeatCount },
    () => activeProjects,
  ).flat();

  const {
    scrollerRef,
    isDragging,
    handleScroll,
    onPointerDown,
    onPointerMove,
    onPointerEnd,
    shouldPreventClick,
  } = useInfiniteCarousel(oneSetProjects.length);

  const handleSelect = (project: Project, imageIndex = 0) => {
    if (shouldPreventClick()) return;
    if (onSelectProject) {
      onSelectProject(project, imageIndex);
      return;
    }
    openProjectModal(project, imageIndex);
  };

  const handlePrev = () => {
    if (activeProjects.length === 0) return;
    setActiveIndex(
      (prev) => (prev - 1 + activeProjects.length) % activeProjects.length,
    );
  };

  const handleNext = () => {
    if (activeProjects.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % activeProjects.length);
  };

  const coverMedia =
    currentProject?.media.find((m) => m.isCover) ?? currentProject?.media[0];
  const galleryThumbs = (currentProject?.media ?? [])
    .filter((m) => m.id !== coverMedia?.id)
    .slice(0, 3);

  return (
    <section
      id="du-an"
      ref={ref}
      className={cn(
        "relative w-full scroll-mt-20 overflow-hidden bg-[#222220] text-[#F7F4E6] transition-colors duration-700 ease-out",
        theme.sectionBgLg,
        theme.textPrimaryLg,
      )}
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
      <div className="mx-auto max-w-6xl px-6 pt-20 pb-10 sm:px-10 sm:pt-24 sm:pb-12">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <h2 className="text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.06] font-bold tracking-[-0.03em]">
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
            <p
              className={cn(
                "max-w-lg text-sm leading-relaxed text-[#D6D3C9] transition-colors duration-700 sm:text-base",
                theme.textMutedLg,
              )}
            >
              Những dự án Khang Việt trực tiếp khảo sát, thiết kế và thi công
              trọn gói — từ mặt tiền showroom, hệ thống bảng hiệu ngân hàng
              đến không gian siêu thị và trung tâm thương mại.
            </p>

            <Link
              href="/projects"
              className="mt-5 inline-flex items-center gap-2 border-b border-current/60 pb-1 text-sm font-semibold transition-opacity duration-200 hover:opacity-75"
            >
              Xem tất cả công trình
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* MOBILE (< lg): Simple Dark Horizontal Carousel */}
      <div
        className={cn(
          "pb-16 transition-all duration-700 ease-out lg:hidden",
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
                  onSelect={(p) => handleSelect(p, 0)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* DESKTOP (lg+): Limited-Width Asymmetric Bento Slide with Dynamic Brand Theme */}
      {currentProject && (
        <div
          className={cn(
            "mx-auto hidden max-w-6xl px-10 pb-24 transition-all duration-700 ease-out lg:block",
            inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
          style={{ transitionDelay: "240ms" }}
        >
          {/* Slide Selector & Prev/Next Controls */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {activeProjects.map((proj, idx) => {
                const isActive = idx === safeIndex;
                const shortName =
                  proj.organization?.name?.split("(")[0]?.trim() || proj.title;
                return (
                  <button
                    key={proj.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={cn(
                      "cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300",
                      isActive
                        ? `${theme.accentBg} text-white shadow-sm`
                        : `border ${theme.controlBorder} bg-white/40 opacity-75 hover:opacity-100`,
                    )}
                  >
                    {`0${idx + 1}`} · {shortName}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Công trình trước"
                className={cn(
                  "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border bg-white/50 text-sm font-bold transition-all duration-200",
                  theme.controlBorder,
                )}
              >
                ←
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Công trình tiếp theo"
                className={cn(
                  "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border bg-white/50 text-sm font-bold transition-all duration-200",
                  theme.controlBorder,
                )}
              >
                →
              </button>
            </div>
          </div>

          {/* Asymmetric Bento Grid (1 Large Cover + Info Card + 3 Gallery Tiles) */}
          <div
            key={currentProject.id}
            className="grid grid-cols-12 gap-5"
          >
            {/* Largest Tile: Cover Photo */}
            <button
              type="button"
              onClick={() => handleSelect(currentProject, 0)}
              className="group relative col-span-7 min-h-116 cursor-pointer overflow-hidden rounded-3xl bg-black/10 text-left shadow-sm"
            >
              <img
                src={
                  coverMedia?.storageKey ?? "/image/image-placeholder.png"
                }
                alt={currentProject.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

              <div className="relative z-10 flex h-full flex-col justify-between p-7">
                <div className="flex justify-between">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-3.5 py-1 text-xs font-semibold text-white shadow-sm transition-colors duration-500",
                      theme.accentBg,
                    )}
                  >
                    {currentProject.year} · Công trình thực tế
                  </span>
                </div>

                <div className="flex items-end justify-between gap-4">
                  <span className="text-xs font-medium tracking-wider text-white/85 uppercase">
                    Nhấn để phóng to hồ sơ ảnh
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-[#1e1e1e] transition-transform duration-200 group-hover:translate-x-0.5">
                    Xem ảnh lớn →
                  </span>
                </div>
              </div>
            </button>

            {/* Right Column: Project Details + 3 Supporting Gallery Tiles */}
            <div className="col-span-5 flex flex-col justify-between gap-5">
              <div
                className={cn(
                  "flex flex-1 flex-col justify-between rounded-3xl border p-7 backdrop-blur-sm transition-colors duration-500",
                  theme.cardBg,
                  theme.accentBorder,
                )}
              >
                <div>
                  <span
                    className={cn(
                      "inline-block text-xs font-bold tracking-wider uppercase transition-colors duration-500",
                      theme.accentText,
                    )}
                  >
                    {currentProject.organization?.name ?? "Khang Việt Design"}
                  </span>
                  <h3 className="mt-2.5 text-2xl leading-[1.18] font-bold tracking-[-0.02em]">
                    {currentProject.title}
                  </h3>
                  {currentProject.summary && (
                    <p
                      className={cn(
                        "mt-3 line-clamp-3 text-sm leading-relaxed",
                        theme.textMutedLg,
                      )}
                    >
                      {currentProject.summary}
                    </p>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => handleSelect(currentProject, 0)}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-semibold text-white transition-all duration-300 hover:opacity-90",
                      theme.accentBg,
                    )}
                  >
                    Xem toàn bộ ({currentProject.media.length} ảnh)
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>

              {/* 3 Supporting Gallery Tiles */}
              <div className="grid h-40 grid-cols-3 gap-3.5">
                {galleryThumbs.map((media, idx) => (
                  <button
                    key={media.id}
                    type="button"
                    onClick={() => handleSelect(currentProject, idx + 1)}
                    className="group relative cursor-pointer overflow-hidden rounded-2xl bg-black/10"
                  >
                    <img
                      src={media.storageKey}
                      alt={media.caption ?? currentProject.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/20" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProjectShowcase;
