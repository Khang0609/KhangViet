"use client";

import React from "react";
import { Search, Share2, X } from "lucide-react";
import type { GalleryFilterState } from "@khangviet/types";

interface GalleryFilterBarProps {
  filter: GalleryFilterState;
  categories: string[];
  resultCount: number;
  onUpdateFilter: <K extends keyof GalleryFilterState>(
    key: K,
    value: GalleryFilterState[K]
  ) => void;
  onCopyShareUrl: () => void;
}

const SEGMENT_OPTIONS: { value: GalleryFilterState["segment"]; label: string }[] =
  [
    { value: "ALL", label: "Tất cả" },
    { value: "B2B", label: "Chuỗi B2B" },
    { value: "C2B", label: "Khách lẻ (C2B)" },
  ];

const STAGE_OPTIONS: {
  value: GalleryFilterState["stage"];
  label: string;
  dotColor?: string;
}[] = [
  { value: "ALL", label: "Mọi giai đoạn" },
  {
    value: "COMPLETED",
    label: "Đã hoàn thiện (Thực tế)",
    dotColor: "bg-emerald-400",
  },
  {
    value: "TENDER_3D",
    label: "Trúng thầu (2D/3D)",
    dotColor: "bg-brand",
  },
];

export const GalleryFilterBar: React.FC<GalleryFilterBarProps> = ({
  filter,
  categories,
  resultCount,
  onUpdateFilter,
  onCopyShareUrl,
}) => {
  return (
    <div className="sticky top-20 z-30 border-b border-black/8 bg-[#f4f1ea]/95 backdrop-blur-md">
      <div className="mx-auto max-w-360 space-y-3 px-5 py-3.5 md:px-8 xl:px-12">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Segmented Control: B2B vs C2B */}
            <div
              className="inline-flex rounded-full border border-black/10 bg-white p-1"
              role="group"
              aria-label="Phân khúc khách hàng"
            >
              {SEGMENT_OPTIONS.map((opt) => {
                const active = filter.segment === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onUpdateFilter("segment", opt.value)}
                    className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "bg-[#1a1918] text-white"
                        : "text-[#625f5a] hover:text-[#1a1918]"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Stage Toggle: Thực tế vs 2D/3D */}
            <div
              className="inline-flex flex-wrap rounded-full border border-black/10 bg-white p-1"
              role="group"
              aria-label="Giai đoạn dự án"
            >
              {STAGE_OPTIONS.map((opt) => {
                const active = filter.stage === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onUpdateFilter("stage", opt.value)}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "bg-[#eae5dc] text-[#1a1918]"
                        : "text-[#625f5a] hover:text-[#1a1918]"
                    }`}
                  >
                    {opt.dotColor && (
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${opt.dotColor}`}
                      />
                    )}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full lg:w-72">
              <Search className="absolute top-1/2 left-3.5 h-3.5 w-3.5 -translate-y-1/2 text-[#625f5a]" />
              <input
                type="text"
                value={filter.search}
                onChange={(e) => onUpdateFilter("search", e.target.value)}
                placeholder="Tìm BIDV, GO!, Quận 7, Inox..."
                className="w-full rounded-full border border-black/10 bg-white py-2 pr-8 pl-9 text-xs text-[#1a1918] placeholder-[#625f5a]/70 outline-hidden transition-colors focus:border-(--accent-bronze)"
              />
              {filter.search && (
                <button
                  type="button"
                  onClick={() => onUpdateFilter("search", "")}
                  aria-label="Xóa từ khóa"
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-[#625f5a] hover:text-[#1a1918]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onCopyShareUrl}
              title="Sao chép đường dẫn kèm bộ lọc hiện tại để gửi khách hàng"
              className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-black/10 bg-white px-3.5 py-2 text-xs font-medium text-[#1a1918] transition-colors hover:border-[#1a1918]"
            >
              <Share2 className="h-3.5 w-3.5 text-(--accent-bronze)" />
              <span className="hidden sm:inline">Gửi link danh mục</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-black/8 pt-2.5">
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
            {["ALL", ...categories].map((cat) => {
              const active = filter.category === cat;
              const label = cat === "ALL" ? "Tất cả hạng mục" : cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onUpdateFilter("category", cat)}
                  className={`shrink-0 cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    active
                      ? "border-[#1a1918] bg-[#1a1918] text-white"
                      : "border-black/10 bg-white text-[#625f5a] hover:border-black/25 hover:text-[#1a1918]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="hidden shrink-0 text-xs text-[#625f5a] sm:block">
            Hiển thị <span className="font-semibold text-[#1a1918]">{resultCount}</span>{" "}
            công trình
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryFilterBar;
