"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  Layers,
  MapPin,
} from "lucide-react";
import type { GalleryProject, ProjectGalleryResponse } from "@khangviet/types";
import {
  getCrossLinksForProject,
  getProjectCoverUrl,
  getProjectRenderUrl,
  resolveGalleryClusters,
} from "@/lib/galleryClusters";
import { ProjectDetailDrawer } from "./ProjectDetailDrawer";
import { QuoteRequestModal } from "./QuoteRequestModal";

interface SplitViewExplorerProps {
  data: ProjectGalleryResponse;
  groupType: "partner" | "solution";
  slug: string;
}

export const SplitViewExplorer: React.FC<SplitViewExplorerProps> = ({
  data,
  groupType,
  slug,
}) => {
  const { partnerClusters, solutionClusters } = useMemo(
    () => resolveGalleryClusters(data),
    [data]
  );

  const siblingClusters =
    groupType === "partner" ? partnerClusters : solutionClusters;

  const currentCluster = useMemo(
    () =>
      siblingClusters.find((c) => c.config.slug === slug) ??
      siblingClusters[0],
    [siblingClusters, slug]
  );

  const projects = currentCluster?.projects ?? [];
  const accentColor = currentCluster?.config.accentColor ?? "#F58633";

  const [selectedId, setSelectedId] = useState<string>(projects[0]?.id ?? "");
  const [previewMode, setPreviewMode] = useState<"actual" | "3d">("actual");
  const [drawerProject, setDrawerProject] = useState<GalleryProject | null>(
    null
  );
  const [quoteProject, setQuoteProject] = useState<GalleryProject | null>(null);

  const [prevSlug, setPrevSlug] = useState(slug);
  if (prevSlug !== slug) {
    setPrevSlug(slug);
    if (!projects.some((p) => p.id === selectedId) && projects[0]) {
      setSelectedId(projects[0].id);
    }
    setPreviewMode("actual");
  }

  // Đồng bộ lựa chọn ban đầu từ URL query (?project=...&view=3d) khi điều hướng từ Tầng 1 hoặc Cross-link
  useEffect(() => {
    if (projects.length === 0) return;
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const paramProjectId = params.get("project");
    const paramView = params.get("view");

    queueMicrotask(() => {
      if (!active) return;
      if (paramProjectId && projects.some((p) => p.id === paramProjectId)) {
        setSelectedId(paramProjectId);
      }
      setPreviewMode(paramView === "3d" ? "3d" : "actual");
    });
    return () => {
      active = false;
    };
  }, [slug, projects]);

  const activeProject =
    projects.find((p) => p.id === selectedId) ?? projects[0] ?? null;

  const crossLinks = useMemo(() => {
    if (!activeProject) return [];
    return getCrossLinksForProject(
      activeProject,
      groupType,
      partnerClusters,
      solutionClusters
    );
  }, [activeProject, groupType, partnerClusters, solutionClusters]);

  const activeCoverUrl = activeProject ? getProjectCoverUrl(activeProject) : "";
  const activeRenderUrl = activeProject ? getProjectRenderUrl(activeProject) : null;
  const has3D = Boolean(activeRenderUrl && activeRenderUrl !== activeCoverUrl);
  const activeImageSrc =
    previewMode === "3d" && activeRenderUrl ? activeRenderUrl : activeCoverUrl;

  if (!currentCluster) {
    return (
      <div className="mx-auto max-w-360 px-5 pt-32 pb-20 text-center md:px-8">
        <p className="text-sm text-[#625f5a]">
          Không tìm thấy nhóm dự án được yêu cầu.
        </p>
        <Link
          href="/projects"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1a1918] px-5 py-2.5 text-xs font-semibold text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Quay lại Kho dự án
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1a1918]">
      {/* Tầng 2 Editorial Header */}
      <section className="border-b border-black/8 bg-[#f4f1ea] pt-28 pb-8 sm:pt-32">
        <div className="mx-auto max-w-6xl px-5 md:px-8 xl:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full border border-black/12 bg-white px-4 py-1.5 text-xs font-medium text-[#1a1918] transition-colors hover:border-[#1a1918]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Quay lại tổng quan Bento</span>
            </Link>

            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#625f5a]">
              <Layers className="h-3.5 w-3.5" style={{ color: accentColor }} />
              {groupType === "partner"
                ? "Hồ sơ Đối tác chiến lược"
                : "Chuyên trang Giải pháp kỹ thuật"}
            </span>
          </div>

          <div className="mt-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
                {currentCluster.config.subtitle && (
                  <span className="text-xs font-semibold tracking-wider text-[#625f5a] uppercase">
                    {currentCluster.config.subtitle}
                  </span>
                )}
              </div>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1a1918] sm:text-4xl">
                {currentCluster.config.title}
              </h1>

              {currentCluster.config.description && (
                <p className="mt-3 text-sm leading-relaxed text-[#625f5a]">
                  {currentCluster.config.description}
                </p>
              )}
            </div>

            <div className="shrink-0 rounded-2xl border border-black/8 bg-white px-5 py-3.5">
              <div className="text-[11px] font-medium tracking-wider text-[#625f5a] uppercase">
                Số lượng hồ sơ
              </div>
              <div className="mt-0.5 text-2xl font-semibold text-[#1a1918] tabular-nums">
                {projects.length}{" "}
                <span className="text-sm font-normal text-[#625f5a]">
                  công trình
                </span>
              </div>
            </div>
          </div>

          {/* Sibling Quick Switcher */}
          <div className="mt-7 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="mr-1 shrink-0 text-[11px] font-semibold tracking-wider text-[#625f5a] uppercase">
              {groupType === "partner" ? "Đối tác khác:" : "Giải pháp khác:"}
            </span>
            {siblingClusters.map((sibling) => {
              const isCurrent = sibling.config.slug === currentCluster.config.slug;
              return (
                <Link
                  key={sibling.config.id}
                  href={sibling.href}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                    isCurrent
                      ? "border-[#1a1918] bg-[#1a1918] text-white"
                      : "border-black/10 bg-white text-[#1a1918]/80 hover:border-black/30 hover:text-[#1a1918]"
                  }`}
                >
                  {sibling.config.title}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Split-View Index (Theo bố cục Wireframe B2) */}
      <main className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-12 xl:px-10">
        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="font-mono text-xs text-[#625f5a]">
            SPLIT-VIEW INDEX · Rê chuột hoặc chạm vào danh sách bên trái để xem nhanh hình ảnh thực tế bên phải.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Cột Trái: Danh sách dự án trong cụm */}
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-white lg:col-span-7">
            <div className="divide-y divide-black/8">
              {projects.map((project, index) => {
                const isSelected = activeProject?.id === project.id;
                const displayIndex = String(index + 1).padStart(2, "0");
                const serviceLabel =
                  project.services.map((s) => s.name).join(" • ") ||
                  "Thiết kế & Thi công";

                return (
                  <div
                    key={project.id}
                    onMouseEnter={() => {
                      setSelectedId(project.id);
                      setPreviewMode("actual");
                    }}
                    onClick={() => {
                      setSelectedId(project.id);
                      setPreviewMode("actual");
                    }}
                    className={`group flex cursor-pointer items-center justify-between gap-4 p-4 transition-colors sm:px-6 sm:py-5 ${
                      isSelected
                        ? "bg-[#f4f1ea]/90"
                        : "bg-white hover:bg-[#faf9f6]"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-3">
                        <span
                          className="mt-0.5 shrink-0 font-mono text-xs font-semibold tabular-nums"
                          style={{
                            color: isSelected ? accentColor : "#625f5a",
                          }}
                        >
                          {displayIndex}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h2 className="text-sm leading-snug font-semibold text-[#1a1918] sm:text-base">
                            {project.title}
                          </h2>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#625f5a]">
                            <span className="rounded-md border border-black/8 bg-white px-2 py-0.5 font-medium text-[#1a1918]">
                              {serviceLabel}
                            </span>
                            {project.organization && (
                              <>
                                <span>•</span>
                                <span>{project.organization.name}</span>
                              </>
                            )}
                            {project.year && (
                              <>
                                <span>•</span>
                                <span>{project.year}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId(project.id);
                        setDrawerProject(project);
                      }}
                      className={`inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        isSelected
                          ? "bg-[#1a1918] text-white"
                          : "text-[#625f5a] group-hover:text-[#1a1918]"
                      }`}
                    >
                      <span>Chi tiết</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cột Phải: Sticky Preview Card + Cross-links */}
          {activeProject && (
            <div className="space-y-4 lg:sticky lg:top-28 lg:col-span-5">
              <div className="overflow-hidden rounded-2xl border border-black/12 bg-white p-4 shadow-sm sm:p-5">
                {/* Top Preview Meta + Actual/3D Toggle */}
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-[#625f5a]">
                    {activeProject.slug}
                  </span>

                  <div className="inline-flex items-center rounded-full border border-black/10 bg-[#f4f1ea] p-0.5">
                    <button
                      type="button"
                      onClick={() => setPreviewMode("actual")}
                      className={`cursor-pointer rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase transition-colors ${
                        previewMode === "actual"
                          ? "bg-[#1a1918] text-white"
                          : "text-[#625f5a] hover:text-[#1a1918]"
                      }`}
                    >
                      Ảnh thực tế
                    </button>
                    {has3D && (
                      <button
                        type="button"
                        onClick={() => setPreviewMode("3d")}
                        className={`cursor-pointer rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase transition-colors ${
                          previewMode === "3d"
                            ? "bg-[#1a1918] text-white"
                            : "text-[#625f5a] hover:text-[#1a1918]"
                        }`}
                      >
                        Phối cảnh 3D
                      </button>
                    )}
                  </div>
                </div>

                {/* Preview Image Frame */}
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-black/8 bg-[#eae5dc]">
                  <img
                    src={activeImageSrc}
                    alt={activeProject.title}
                    className="h-full w-full object-cover transition-all duration-300"
                  />
                </div>

                {/* Bottom Preview Copy + CTA */}
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base leading-snug font-semibold text-[#1a1918]">
                      {activeProject.title}
                    </h3>
                    <p className="mt-1 text-xs text-[#625f5a]">
                      {activeProject.services.map((s) => s.name).join(" • ") ||
                        "Thiết kế & Thi công"}
                      {activeProject.organization
                        ? ` • ${activeProject.organization.name}`
                        : ""}
                      {activeProject.year ? ` • ${activeProject.year}` : ""}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDrawerProject(activeProject)}
                    className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-[#1a1918] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-(--accent-bronze)"
                  >
                    <span>Xem hồ sơ</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Cross-Links Panel */}
              {crossLinks.length > 0 && (
                <div className="rounded-2xl border border-black/10 bg-[#f4f1ea]/80 p-4 sm:p-5">
                  <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold tracking-[0.12em] text-[#625f5a] uppercase">
                    <Compass className="h-3.5 w-3.5 text-(--accent-bronze)" />
                    <span>Khám phá liên kết chéo</span>
                  </div>

                  <div className="space-y-2.5">
                    {crossLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="group flex items-center justify-between gap-3 rounded-xl border border-black/8 bg-white px-4 py-3 transition-all hover:border-[#1a1918]"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{
                              backgroundColor: link.accentColor ?? "#F58633",
                            }}
                          />
                          <div className="min-w-0">
                            <div className="truncate text-xs font-semibold text-[#1a1918]">
                              {link.label}
                            </div>
                            <div className="truncate text-[11px] text-[#625f5a]">
                              {link.sublabel}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#625f5a] transition-transform group-hover:translate-x-0.5 group-hover:text-[#1a1918]" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <ProjectDetailDrawer
        project={drawerProject}
        onClose={() => setDrawerProject(null)}
        onRequestQuote={(project) => {
          setDrawerProject(null);
          setQuoteProject(project);
        }}
      />

      <QuoteRequestModal
        project={quoteProject}
        onClose={() => setQuoteProject(null)}
      />
    </div>
  );
};

export default SplitViewExplorer;
