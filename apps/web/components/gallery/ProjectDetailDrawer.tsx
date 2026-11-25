"use client";

import React, { useEffect, useState } from "react";
import { Calendar, X } from "lucide-react";
import type { GalleryProject } from "@khangviet/types";
import { getProjectCoverUrl, getProjectRenderUrl } from "@/lib/galleryClusters";

interface ProjectDetailDrawerProps {
  project: GalleryProject | null;
  onClose: () => void;
  onRequestQuote: (project: GalleryProject) => void;
}

type DrawerStageTab = "render3d" | "actual" | "compare";

export const ProjectDetailDrawer: React.FC<ProjectDetailDrawerProps> = ({
  project,
  onClose,
  onRequestQuote,
}) => {
  const [activeTab, setActiveTab] = useState<DrawerStageTab>("actual");
  const [sliderValue, setSliderValue] = useState(50);

  const projectId = project?.id ?? null;
  const [prevProjectId, setPrevProjectId] = useState<string | null>(projectId);
  if (prevProjectId !== projectId) {
    setPrevProjectId(projectId);
    if (projectId) {
      setActiveTab("actual");
      setSliderValue(50);
    }
  }

  useEffect(() => {
    if (!project) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [project, onClose]);

  if (!project) return null;

  const imgActual = getProjectCoverUrl(project);
  const img3D = getProjectRenderUrl(project) || imgActual;
  const serviceLabel =
    project.services.map((s) => s.name).join(" • ") || "Thiết kế & Thi công";

  const singleImgSrc = activeTab === "render3d" ? img3D : imgActual;
  const singleCaption =
    activeTab === "render3d"
      ? "Phối cảnh thiết kế 2D/3D trình duyệt"
      : "Ảnh thực tế thi công & nghiệm thu";

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/75 backdrop-blur-xs"
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        className="fixed top-0 right-0 z-50 flex h-full w-full max-w-2xl flex-col border-l border-black/10 bg-[#f4f1ea] text-[#1a1918] shadow-2xl"
      >
        {/* Drawer Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-black/8 bg-white/80 px-5 py-4 backdrop-blur-md">
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
              {project.organization?.name || "Hồ sơ công trình"}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng chi tiết dự án"
            className="cursor-pointer rounded-full border border-black/10 bg-white p-1.5 text-[#1a1918] transition-colors hover:bg-[#1a1918] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
          <div>
            <div className="text-xs font-semibold tracking-wider text-(--accent-bronze) uppercase">
              {project.organization?.name || "Khách hàng Khang Việt"}
            </div>
            <h2 className="mt-1 text-xl leading-snug font-semibold text-[#1a1918] sm:text-2xl">
              {project.title}
            </h2>
            {project.year && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#625f5a]">
                <Calendar className="h-3.5 w-3.5 shrink-0 text-(--accent-bronze)" />
                <span>Năm thực hiện: {project.year}</span>
              </p>
            )}
          </div>

          {/* Image Stage Switcher */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold tracking-wider text-[#625f5a] uppercase">
                Hồ sơ hình ảnh công trình
              </span>
              <div className="inline-flex rounded-full border border-black/10 bg-white p-1">
                {(
                  [
                    { id: "render3d", label: "Phối cảnh 2D/3D" },
                    { id: "actual", label: "Thực tế hoàn thiện" },
                    { id: "compare", label: "⇄ So sánh 3D & Thực tế" },
                  ] as const
                ).map((tab) => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        active
                          ? "bg-[#1a1918] text-white"
                          : "text-[#625f5a] hover:text-[#1a1918]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {activeTab !== "compare" ? (
              <div className="relative aspect-16/10 overflow-hidden rounded-xl border border-white/8 bg-zinc-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={singleImgSrc}
                  alt={project.title}
                  className="h-full w-full object-cover"
                />
                {activeTab === "render3d" && (
                  <div className="blueprint-grid-orange pointer-events-none absolute inset-0" />
                )}
                <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between rounded-lg border border-white/10 bg-black/80 px-3 py-2 text-xs text-zinc-200 backdrop-blur-xs">
                  <span>{singleCaption}</span>
                  <span className="text-[10px] font-bold text-brand uppercase">
                    {serviceLabel}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative aspect-16/10 select-none overflow-hidden rounded-xl border border-brand/40 bg-zinc-950">
                  {/* Base Layer: Thực tế hoàn thiện */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgActual}
                    alt="Thực tế hoàn thiện"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute top-3 right-3 rounded bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold text-white uppercase">
                    Thực tế nghiệm thu
                  </span>

                  {/* Overlay Layer: Phối cảnh 2D/3D (Clipped cleanly) */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: `inset(0 ${100 - sliderValue}% 0 0)` }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img3D}
                      alt="Phối cảnh 2D/3D"
                      className="h-full w-full object-cover"
                    />
                    <div className="blueprint-grid-orange pointer-events-none absolute inset-0" />
                    <span className="absolute top-3 left-3 rounded bg-brand px-2.5 py-1 text-[10px] font-bold text-white uppercase">
                      Bản vẽ 2D/3D đấu thầu
                    </span>
                  </div>

                  {/* Divider Line */}
                  <div
                    className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-brand"
                    style={{ left: `${sliderValue}%` }}
                  >
                    <div className="absolute top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-xs font-bold text-white shadow-lg">
                      ⇄
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-1">
                  <span className="shrink-0 text-[11px] font-medium text-brand">
                    2D/3D
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={sliderValue}
                    onChange={(e) => setSliderValue(Number(e.target.value))}
                    aria-label="Thanh trượt so sánh phối cảnh 3D và thực tế"
                    className="w-full cursor-ew-resize accent-orange-500"
                  />
                  <span className="shrink-0 text-[11px] font-medium text-emerald-400">
                    Thực tế
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Technical Specs */}
          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <h3 className="mb-3 text-xs font-semibold tracking-wider text-[#625f5a] uppercase">
              Thông số kỹ thuật &amp; Quy mô
            </h3>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-xs sm:grid-cols-2">
              <div className="flex justify-between border-b border-black/8 pb-2 sm:block sm:border-b-0 sm:pb-0">
                <dt className="text-[#625f5a]">Đối tác / Thương hiệu</dt>
                <dd className="mt-0.5 font-semibold text-[#1a1918]">
                  {project.organization?.name || "Khách hàng Khang Việt"}
                </dd>
              </div>
              <div className="flex justify-between border-b border-black/8 pb-2 sm:block sm:border-b-0 sm:pb-0">
                <dt className="text-[#625f5a]">Hạng mục triển khai</dt>
                <dd className="mt-0.5 font-semibold text-[#1a1918]">
                  {serviceLabel}
                </dd>
              </div>
              <div className="flex justify-between border-b border-black/8 pb-2 sm:block sm:border-b-0 sm:pb-0">
                <dt className="text-[#625f5a]">Năm thực hiện</dt>
                <dd className="mt-0.5 font-semibold text-[#1a1918]">
                  {project.year || 2025}
                </dd>
              </div>
              <div className="flex justify-between sm:block">
                <dt className="text-[#625f5a]">Số lượng hình ảnh</dt>
                <dd className="mt-0.5 font-semibold text-[#1a1918]">
                  {project.media.length} ảnh hồ sơ
                </dd>
              </div>
            </dl>
          </div>

          {/* Engineering Description */}
          {project.summary && (
            <div>
              <h3 className="mb-2 text-xs font-semibold tracking-wider text-[#625f5a] uppercase">
                Ghi chú thi công từ xưởng Khang Việt
              </h3>
              <p className="text-xs leading-relaxed text-[#1a1918]/85 sm:text-sm">
                {project.summary}
              </p>
            </div>
          )}
        </div>

        {/* Sticky Footer CTA */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-black/8 bg-white p-4">
          <div className="text-xs">
            <span className="block text-[#625f5a]">
              Bạn cần hạng mục tương tự?
            </span>
            <span className="font-semibold text-[#1a1918]">
              Xưởng sản xuất trực tiếp • Không qua trung gian
            </span>
          </div>
          <button
            type="button"
            onClick={() => onRequestQuote(project)}
            className="shrink-0 cursor-pointer rounded-full bg-[#1a1918] px-5 py-2.5 text-xs font-medium text-white transition-colors hover:bg-(--accent-bronze)"
          >
            Yêu cầu báo giá mẫu này
          </button>
        </div>
      </aside>
    </>
  );
};

export default ProjectDetailDrawer;
