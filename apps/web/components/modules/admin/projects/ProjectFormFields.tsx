import React from "react";
import type { FeaturedProject } from "@khangviet/types";
import { ImageUrlInput } from "@/components/ui/ImageUrlInput";

interface Props {
  data: FeaturedProject;
  onChange: (field: keyof FeaturedProject, val: unknown) => void;
}

export const ProjectFormFields: React.FC<Props> = ({ data, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block font-mono-tech text-[11px] text-white/50 uppercase">Mã dự án</label>
          <input
            type="text"
            value={data.code}
            onChange={(e) => onChange("code", e.target.value)}
            className="w-full rounded border border-white/10 bg-white/4 px-3 py-2 font-mono-tech text-xs text-white"
            placeholder="KV-PRJ-01"
          />
        </div>
        <div>
          <label className="mb-1 block font-mono-tech text-[11px] text-white/50 uppercase">Tên dự án</label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => onChange("title", e.target.value)}
            className="w-full rounded border border-white/10 bg-white/4 px-3 py-2 font-sans text-xs text-white"
            placeholder="Flagship Showroom..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block font-mono-tech text-[11px] text-white/50 uppercase">Khách hàng / Chủ đầu tư</label>
          <input
            type="text"
            value={data.client}
            onChange={(e) => onChange("client", e.target.value)}
            className="w-full rounded border border-white/10 bg-white/4 px-3 py-2 font-sans text-xs text-white"
          />
        </div>
        <div>
          <label className="mb-1 block font-mono-tech text-[11px] text-white/50 uppercase">Năm hoàn thành</label>
          <input
            type="text"
            value={data.year}
            onChange={(e) => onChange("year", e.target.value)}
            className="w-full rounded border border-white/10 bg-white/4 px-3 py-2 font-mono-tech text-xs text-white"
          />
        </div>
        <div>
          <label className="mb-1 block font-mono-tech text-[11px] text-white/50 uppercase">Quy mô / Diện tích</label>
          <input
            type="text"
            value={data.scaleMetric}
            onChange={(e) => onChange("scaleMetric", e.target.value)}
            className="w-full rounded border border-white/10 bg-white/4 px-3 py-2 font-mono-tech text-xs text-white"
            placeholder="1.200 m²"
          />
        </div>
      </div>

      <ImageUrlInput
        label="Ảnh Bìa Dự Án (Cover Image)"
        value={data.coverImage}
        onChange={(url) => onChange("coverImage", url)}
      />

      <div>
        <label className="mb-1 block font-mono-tech text-[11px] text-white/50 uppercase">Mô tả tóm tắt</label>
        <textarea
          rows={2}
          value={data.summary}
          onChange={(e) => onChange("summary", e.target.value)}
          className="w-full rounded border border-white/10 bg-white/4 px-3 py-2 font-sans text-xs text-white"
        />
      </div>
    </div>
  );
};

export default ProjectFormFields;

