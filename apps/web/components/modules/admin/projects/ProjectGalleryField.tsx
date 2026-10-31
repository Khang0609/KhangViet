import React from "react";
import { Plus } from "lucide-react";
import type { ProjectGalleryItem } from "@khangviet/types";
import { ProjectGalleryRow } from "./ProjectGalleryRow";

interface Props {
  items: ProjectGalleryItem[];
  onChange: (items: ProjectGalleryItem[]) => void;
}

export const ProjectGalleryField: React.FC<Props> = ({ items, onChange }) => {
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

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="font-mono-tech text-xs tracking-wider text-(--text-secondary) uppercase">
          Thư viện ảnh chi tiết ({items.length})
        </label>
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
            onRemove={handleRemove}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectGalleryField;
