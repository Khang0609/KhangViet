"use client";

import React from "react";
import type { GalleryFilterState } from "@khangviet/types";

interface GalleryFilterSidebarProps {
  filter: GalleryFilterState;
  categories: string[];
  onUpdateFilter: <K extends keyof GalleryFilterState>(
    key: K,
    value: GalleryFilterState[K]
  ) => void;
  onResetFilters: () => void;
}

const SEGMENT_OPTIONS: { value: GalleryFilterState["segment"]; label: string }[] =
  [
    { value: "ALL", label: "Tất cả" },
    { value: "B2B", label: "Doanh nghiệp & Chuỗi" },
    { value: "C2B", label: "Cửa hàng & Cá nhân" },
  ];

const STAGE_OPTIONS: {
  value: GalleryFilterState["stage"];
  label: string;
}[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "COMPLETED", label: "Đã hoàn thiện" },
  { value: "TENDER_3D", label: "Phối cảnh thiết kế" },
];

const CATEGORY_LABELS: Record<string, string> = {
  "ARCHITECTURAL FACADE & BANKING FIT-OUT": "Mặt dựng & Nội thất",
  "MEGA-SCALE LED SIGNAGE & PYLON": "Biển hiệu & Pano LED",
};

function formatCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

interface FilterRadioGroupProps<T extends string> {
  title: string;
  options: { value: T; label: string }[];
  selectedValue: T;
  onSelect: (value: T) => void;
}

function FilterRadioGroup<T extends string>({
  title,
  options,
  selectedValue,
  onSelect,
}: FilterRadioGroupProps<T>) {
  return (
    <div className="border-t border-black/8 pt-5 first:border-t-0 first:pt-0">
      <h3 className="text-xs font-semibold text-[#1a1918]">{title}</h3>
      <ul className="mt-3 space-y-2.5">
        {options.map((opt) => {
          const active = selectedValue === opt.value;
          return (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => onSelect(opt.value)}
                aria-pressed={active}
                className="group flex w-full cursor-pointer items-center gap-2.5 text-left text-sm transition-colors"
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    active
                      ? "border-[#1a1918]"
                      : "border-black/25 group-hover:border-[#1a1918]"
                  }`}
                >
                  {active && (
                    <span className="h-2 w-2 rounded-full bg-(--accent-bronze)" />
                  )}
                </span>
                <span
                  className={
                    active
                      ? "font-medium text-[#1a1918]"
                      : "text-[#625f5a] group-hover:text-[#1a1918]"
                  }
                >
                  {opt.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export const GalleryFilterBar: React.FC<GalleryFilterSidebarProps> = ({
  filter,
  categories,
  onUpdateFilter,
  onResetFilters,
}) => {
  const hasActiveFilter =
    filter.segment !== "ALL" ||
    filter.stage !== "ALL" ||
    filter.category !== "ALL" ||
    filter.keyAccount !== "ALL" ||
    filter.search.trim().length > 0;

  const categoryOptions = [
    { value: "ALL", label: "Tất cả" },
    ...categories.map((cat) => ({
      value: cat,
      label: formatCategoryLabel(cat),
    })),
  ];

  return (
    <aside
      aria-label="Bộ lọc dự án"
      className="rounded-2xl border border-black/10 bg-white p-5"
    >
      <div className="mb-5 flex items-center justify-between border-b border-black/8 pb-3.5">
        <span className="text-xs font-semibold tracking-wider text-[#1a1918] uppercase">
          Bộ lọc
        </span>
        {hasActiveFilter && (
          <button
            type="button"
            onClick={onResetFilters}
            className="cursor-pointer text-xs font-medium text-(--accent-bronze) hover:underline"
          >
            Xóa lọc
          </button>
        )}
      </div>

      <div className="space-y-5">
        <FilterRadioGroup
          title="Hạng mục"
          options={categoryOptions}
          selectedValue={filter.category}
          onSelect={(val) => onUpdateFilter("category", val)}
        />

        <FilterRadioGroup
          title="Khách hàng"
          options={SEGMENT_OPTIONS}
          selectedValue={filter.segment}
          onSelect={(val) => onUpdateFilter("segment", val)}
        />

        <FilterRadioGroup
          title="Trạng thái"
          options={STAGE_OPTIONS}
          selectedValue={filter.stage}
          onSelect={(val) => onUpdateFilter("stage", val)}
        />
      </div>
    </aside>
  );
};

export default GalleryFilterBar;
