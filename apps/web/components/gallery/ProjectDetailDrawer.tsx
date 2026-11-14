"use client";

import React, { useEffect, useState } from "react";
import { MapPin, X } from "lucide-react";
import type { GalleryProject } from "@khangviet/types";

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

  useEffect(() => {
    if (!project) return;
    setActiveTab(project.stage === "TENDER_3D" ? "render3d" : "actual");
    setSliderValue(50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [project, onClose]);

  if (!project) return null;

  const isTender3D = project.stage === "TENDER_3D";
  const img3D = project.img3D || project.imgActual;
  const imgActual = project.imgActual;

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
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                isTender3D
                  ? "bg-(--accent-bronze)/15 text-(--accent-bronze)"
                  : "bg-emerald-500/15 text-emerald-700"
              }`}
            >
              {isTender3D ? "Hồ sơ 2D/3D Trúng thầu" : "Đã nghiệm thu thực tế"}
            </span>
            <span className="shrink-0 rounded-full border border-black/10 bg-[#f4f1ea] px-2.5 py-0.5 text-[11px] font-medium text-[#625f5a]">
              {project.segment === "B2B"
                ? "Chuỗi đối tác B2B"
                : "Khách lẻ C2B"}
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
              {project.client}
            </div>
            <h2 className="mt-1 text-xl leading-snug font-semibold text-[#1a1918] sm:text-2xl">
              {project.title}
            </h2>
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#625f5a]">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-(--accent-bronze)" />
              <span>{project.location}</span>
            </p>
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
                    {project.category}
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
                <dt className="text-[#625f5a]">Chủ đầu tư / Nhãn hàng</dt>
                <dd className="mt-0.5 font-semibold text-[#1a1918]">
                  {project.client}
                </dd>
              </div>
              <div className="flex justify-between border-b border-black/8 pb-2 sm:block sm:border-b-0 sm:pb-0">
                <dt className="text-[#625f5a]">Phân khúc triển khai</dt>
                <dd className="mt-0.5 font-semibold text-[#1a1918]">
                  {project.segment === "B2B"
                    ? "Chuỗi đối tác B2B"
                    : "Khách hàng doanh nghiệp lẻ (C2B)"}
                </dd>
              </div>
              <div className="flex justify-between border-b border-black/8 pb-2 sm:block sm:border-b-0 sm:pb-0">
                <dt className="text-[#625f5a]">Vật liệu &amp; Kết cấu chính</dt>
                <dd className="mt-0.5 font-semibold text-[#1a1918]">
                  {project.material}
                </dd>
              </div>
              <div className="flex justify-between sm:block">
                <dt className="text-[#625f5a]">Đội phụ trách &amp; Tiến độ</dt>
                <dd className="mt-0.5 font-semibold text-[#1a1918]">
                  {project.team}
                </dd>
              </div>
            </dl>
          </div>

          {/* Engineering Description */}
          <div>
            <h3 className="mb-2 text-xs font-semibold tracking-wider text-[#625f5a] uppercase">
              Ghi chú thi công từ xưởng Khang Việt
            </h3>
            <p className="text-xs leading-relaxed text-[#1a1918]/85 sm:text-sm">
              {project.desc}
            </p>
          </div>
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
