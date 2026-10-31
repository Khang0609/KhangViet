import React from "react";
import { Plus, Save } from "lucide-react";

interface Props {
  saving: boolean;
  onAdd: () => void;
  onSave: () => void;
}

export const HeroViewActions: React.FC<Props> = ({ saving, onAdd, onSave }) => {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onAdd}
        className="flex items-center gap-1.5 rounded border border-white/10 px-3 py-1.5 font-mono-tech text-xs text-white/80 hover:border-(--accent-bronze)"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>Thêm Slide</span>
      </button>
      <button
        onClick={onSave}
        disabled={saving}
        className="flex items-center gap-1.5 rounded bg-(--color-brand) px-4 py-1.5 font-mono-tech text-xs font-semibold text-black hover:brightness-110 disabled:opacity-50"
      >
        <Save className="h-3.5 w-3.5" />
        <span>{saving ? "Đang lưu..." : "Lưu Slides"}</span>
      </button>
    </div>
  );
};

export default HeroViewActions;

