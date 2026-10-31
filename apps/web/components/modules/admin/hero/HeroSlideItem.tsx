import React from "react";
import { Trash2 } from "lucide-react";
import type { HeroSlide } from "@khangviet/types";
import { ImageUrlInput } from "@/components/ui/ImageUrlInput";

interface Props {
  slide: HeroSlide;
  index: number;
  onChange: (index: number, field: keyof HeroSlide, val: string) => void;
  onRemove: (index: number) => void;
}

export const HeroSlideItem: React.FC<Props> = ({ slide, index, onChange, onRemove }) => {
  return (
    <div className="space-y-3 rounded-lg border border-white/8 bg-white/2 p-4">
      <div className="flex items-center justify-between border-b border-white/6 pb-2">
        <span className="font-mono-tech text-xs text-(--accent-bronze)">
          SLIDE 0{index + 1}
        </span>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-red-400 hover:text-red-300"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block font-mono-tech text-[10px] text-white/50 uppercase">Tag / Phân loại</label>
          <input
            type="text"
            value={slide.tag}
            onChange={(e) => onChange(index, "tag", e.target.value)}
            className="w-full rounded border border-white/10 bg-white/4 px-2.5 py-1.5 font-mono-tech text-xs text-white"
          />
        </div>
        <div>
          <label className="mb-1 block font-mono-tech text-[10px] text-white/50 uppercase">Địa điểm</label>
          <input
            type="text"
            value={slide.location}
            onChange={(e) => onChange(index, "location", e.target.value)}
            className="w-full rounded border border-white/10 bg-white/4 px-2.5 py-1.5 font-sans text-xs text-white"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block font-mono-tech text-[10px] text-white/50 uppercase">Tiêu đề Slide</label>
        <input
          type="text"
          value={slide.title}
          onChange={(e) => onChange(index, "title", e.target.value)}
          className="w-full rounded border border-white/10 bg-white/4 px-2.5 py-1.5 font-syne text-xs font-bold text-white"
        />
      </div>

      <ImageUrlInput
        label="URL Ảnh Nền (Background Image)"
        value={slide.image}
        onChange={(url) => onChange(index, "image", url)}
      />
    </div>
  );
};

export default HeroSlideItem;

