import React from "react";
import type { CompanyLegalInfo } from "@khangviet/types";

interface Props {
  data: CompanyLegalInfo;
  onChange: (field: keyof CompanyLegalInfo, val: string | number) => void;
}

export const LegalInfoForm: React.FC<Props> = ({ data, onChange }) => {
  return (
    <div className="space-y-4">
      <h4 className="font-mono-tech text-xs tracking-wider text-(--accent-bronze) uppercase">
        02. Pháp Lý & Đại Diện Doanh Nghiệp
      </h4>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block font-mono-tech text-[11px] text-white/50 uppercase">
            Tên đầy đủ công ty
          </label>
          <input
            type="text"
            value={data.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            className="w-full rounded border border-white/10 bg-white/4 px-3 py-2 font-sans text-xs text-(--text-primary) focus:border-(--accent-bronze) focus:outline-hidden"
          />
        </div>

        <div>
          <label className="mb-1 block font-mono-tech text-[11px] text-white/50 uppercase">
            Mã số thuế (MST)
          </label>
          <input
            type="text"
            value={data.taxId}
            onChange={(e) => onChange("taxId", e.target.value)}
            className="w-full rounded border border-white/10 bg-white/4 px-3 py-2 font-mono-tech text-xs text-(--text-primary) focus:border-(--accent-bronze) focus:outline-hidden"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block font-mono-tech text-[11px] text-white/50 uppercase">
            Người đại diện pháp luật
          </label>
          <input
            type="text"
            value={data.director}
            onChange={(e) => onChange("director", e.target.value)}
            className="w-full rounded border border-white/10 bg-white/4 px-3 py-2 font-sans text-xs text-(--text-primary) focus:border-(--accent-bronze) focus:outline-hidden"
          />
        </div>

        <div>
          <label className="mb-1 block font-mono-tech text-[11px] text-white/50 uppercase">
            Chức danh
          </label>
          <input
            type="text"
            value={data.directorTitle}
            onChange={(e) => onChange("directorTitle", e.target.value)}
            className="w-full rounded border border-white/10 bg-white/4 px-3 py-2 font-sans text-xs text-(--text-primary) focus:border-(--accent-bronze) focus:outline-hidden"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block font-mono-tech text-[11px] text-white/50 uppercase">
          Lời cam kết / Tôn chỉ thương hiệu
        </label>
        <textarea
          rows={2}
          value={data.commitment}
          onChange={(e) => onChange("commitment", e.target.value)}
          className="w-full rounded border border-white/10 bg-white/4 px-3 py-2 font-sans text-xs text-(--text-primary) focus:border-(--accent-bronze) focus:outline-hidden"
        />
      </div>
    </div>
  );
};

export default LegalInfoForm;

