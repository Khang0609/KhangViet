import React from "react";
import type { CompanyLegalInfo } from "@khangviet/types";

interface Props {
  data: CompanyLegalInfo;
  onChange: (field: keyof CompanyLegalInfo, val: string | number) => void;
}

export const ContactInfoForm: React.FC<Props> = ({ data, onChange }) => {
  return (
    <div className="space-y-4">
      <h4 className="font-mono-tech text-xs tracking-wider text-(--accent-bronze) uppercase">
        01. Kênh Liên Lạc Trực Tiếp
      </h4>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block font-mono-tech text-[11px] text-white/50 uppercase">
            Hotline (Số nguyên bấm gọi)
          </label>
          <input
            type="text"
            value={data.hotline}
            onChange={(e) => onChange("hotline", e.target.value)}
            className="w-full rounded border border-white/10 bg-white/4 px-3 py-2 font-mono-tech text-xs text-(--text-primary) focus:border-(--accent-bronze) focus:outline-hidden"
          />
        </div>

        <div>
          <label className="mb-1 block font-mono-tech text-[11px] text-white/50 uppercase">
            Hotline hiển thị (Định dạng đẹp)
          </label>
          <input
            type="text"
            value={data.hotlineFormatted}
            onChange={(e) => onChange("hotlineFormatted", e.target.value)}
            className="w-full rounded border border-white/10 bg-white/4 px-3 py-2 font-mono-tech text-xs text-(--text-primary) focus:border-(--accent-bronze) focus:outline-hidden"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block font-mono-tech text-[11px] text-white/50 uppercase">
          Email nhận liên hệ
        </label>
        <input
          type="email"
          value={data.email}
          onChange={(e) => onChange("email", e.target.value)}
          className="w-full rounded border border-white/10 bg-white/4 px-3 py-2 font-sans text-xs text-(--text-primary) focus:border-(--accent-bronze) focus:outline-hidden"
        />
      </div>

      <div>
        <label className="mb-1 block font-mono-tech text-[11px] text-white/50 uppercase">
          Địa chỉ xưởng & văn phòng sản xuất
        </label>
        <textarea
          rows={2}
          value={data.factoryAddress}
          onChange={(e) => onChange("factoryAddress", e.target.value)}
          className="w-full rounded border border-white/10 bg-white/4 px-3 py-2 font-sans text-xs text-(--text-primary) focus:border-(--accent-bronze) focus:outline-hidden"
        />
      </div>
    </div>
  );
};

export default ContactInfoForm;

