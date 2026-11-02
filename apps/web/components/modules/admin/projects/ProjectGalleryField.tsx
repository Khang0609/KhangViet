"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import type { ProjectGalleryItem } from "@khangviet/types";
import { ProjectGalleryRow } from "./ProjectGalleryRow";

interface Props {
  items: ProjectGalleryItem[];
  onChange: (items: ProjectGalleryItem[]) => void;
}

export const ProjectGalleryField: React.FC<Props> = ({ items, onChange }) => {
  const [bypassUrl, setBypassUrl] = useState(true);

  const handleAddItem = () => {
    const newItem: ProjectGalleryItem = {
      id: `img-${Date.now()}`,
      src: "",
      caption: "Chi tiết thi công",
      location: "Xưởng Khang Việt",
      spec: "Vật liệu tiêu chuẩn",
      aspect: "landscape",
    };
    onChange([...items, newItem]);
  };

  const handleUpdate = (index: number, field: keyof ProjectGalleryItem, val: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: val };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <label className="font-mono-tech text-xs tracking-wider text-(--text-secondary) uppercase">
            Thư viện ảnh chi tiết ({items.length})
          </label>
          <button
            type="button"
            onClick={() => setBypassUrl((prev) => !prev)}
            className={`rounded border px-2 py-0.5 font-mono-tech text-[10px] transition-colors ${
              bypassUrl
                ? "border-(--accent-bronze) bg-(--accent-bronze)/10 text-(--accent-bronze)"
                : "border-white/10 text-white/40 hover:text-white/60"
            }`}
            title="Cho phép nhập đường dẫn tệp nội bộ thay vì URL web"
          >
            Bypass URL: {bypassUrl ? "BẬT (File Path)" : "TẮT (Strict URL)"}
          </button>
        </div>
        <button
          type="button"
          onClick={handleAddItem}
          className="flex items-center gap-1 font-mono-tech text-xs text-(--accent-bronze) hover:underline"
        >
          <Plus className="h-3 w-3" />
          <span>Thêm ảnh</span>
        </button>
      </div>

      <div className="max-h-60 space-y-3 overflow-y-auto pr-1">
        {items.map((item, idx) => (
          <ProjectGalleryRow
            key={item.id || idx}
            item={item}
            index={idx}
            onUpdate={handleUpdate}
            onRemove={(i) => onChange(items.filter((_, index) => index !== i))}
            allowFilePath={bypassUrl}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectGalleryField;
