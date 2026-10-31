import React from "react";
import { Trash2 } from "lucide-react";
import type { ProjectGalleryItem } from "@khangviet/types";
import { ImageUrlInput } from "@/components/ui/ImageUrlInput";

interface Props {
  item: ProjectGalleryItem;
  index: number;
  onUpdate: (index: number, field: keyof ProjectGalleryItem, val: string) => void;
  onRemove: (index: number) => void;
}

export const ProjectGalleryRow: React.FC<Props> = ({ item, index, onUpdate, onRemove }) => {
  return (
    <div className="rounded border border-white/8 bg-white/2 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-mono-tech text-[10px] text-white/40">Ảnh #{index + 1}</span>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-red-400 hover:text-red-300"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
      <ImageUrlInput
        label="URL Ảnh"
        value={item.src}
        onChange={(url) => onUpdate(index, "src", url)}
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="Chú thích ảnh"
          value={item.caption}
          onChange={(e) => onUpdate(index, "caption", e.target.value)}
          className="rounded border border-white/10 bg-white/4 px-2 py-1 text-xs text-white"
        />
        <select
          value={item.aspect}
          onChange={(e) => onUpdate(index, "aspect", e.target.value)}
          className="rounded border border-white/10 bg-(--bg-surface) px-2 py-1 text-xs text-white"
        >
          <option value="landscape">Khung Ngang (Landscape)</option>
          <option value="portrait">Khung Dọc (Portrait)</option>
          <option value="wide">Khung Rộng (Wide)</option>
        </select>
      </div>
    </div>
  );
};

export default ProjectGalleryRow;

