"use client";

import React from "react";
import { Crosshair, RotateCcw } from "lucide-react";
import type { GalleryFocalPoint } from "@khangviet/types";

interface FocalPointPickerProps {
  imageUrl: string;
  value?: GalleryFocalPoint;
  onChange: (point: GalleryFocalPoint) => void;
  className?: string;
}

export const FocalPointPicker: React.FC<FocalPointPickerProps> = ({
  imageUrl,
  value = { x: 50, y: 50 },
  onChange,
  className = "",
}) => {
  const handlePick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = Math.round(
      Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))
    );
    const y = Math.round(
      Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100))
    );
    onChange({ x, y });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1.5 font-medium text-[#1a1918]">
          <Crosshair className="h-3.5 w-3.5 text-(--accent-bronze)" />
          Chạm vào ảnh để chọn điểm lấy nét ({value.x}%, {value.y}%)
        </span>
        <button
          type="button"
          onClick={() => onChange({ x: 50, y: 50 })}
          className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-medium text-[#625f5a] hover:text-[#1a1918]"
        >
          <RotateCcw className="h-3 w-3" />
          Giữa ảnh
        </button>
      </div>

      <div
        onClick={handlePick}
        title="Nhấn để đặt tâm lấy nét khi ảnh co giãn trong khung Bento"
        className="relative aspect-video w-full cursor-crosshair overflow-hidden rounded-xl border border-black/15 bg-[#eae5dc]"
      >
        <img
          src={imageUrl}
          alt="Chọn điểm lấy nét"
          style={{ objectPosition: `${value.x}% ${value.y}%` }}
          className="h-full w-full object-cover select-none"
        />
        <div
          style={{ left: `${value.x}%`, top: `${value.y}%` }}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-(--accent-bronze)/85 shadow-lg">
            <div className="h-1.5 w-1.5 rounded-full bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocalPointPicker;
