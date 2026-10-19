import React from "react";
import { DraftingCompass, Mail, Upload } from "lucide-react";
import { COMPANY_LEGAL_INFO } from "@/data/khangVietData";
import PhoneCallButton from "../../ui/PhoneCallButton";

export const ContactGateB: React.FC = () => {
  return (
    <div className="border-t border-white/8 bg-(--bg-surface) p-6 md:p-10 lg:border-t-0">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="font-mono-tech text-[9px] tracking-widest text-(--accent-bronze) uppercase">
            Contact gate B
          </span>
          <h3 className="font-syne mt-2 text-2xl font-bold">
            Tổng thầu / Chuỗi tập đoàn
          </h3>
        </div>
        <DraftingCompass className="h-8 w-8 text-white/15" />
      </div>
      <p className="mt-4 max-w-lg text-sm leading-6 text-(--text-secondary)">
        Tiếp nhận hồ sơ mời thầu, BOQ, bản vẽ CAD và yêu cầu triển khai đồng bộ
        chuỗi trên toàn quốc.
      </p>
      <div className="mt-8 border border-dashed border-white/15 bg-[#111215] p-8 text-center transition-colors hover:border-(--accent-bronze)">
        <Upload className="mx-auto h-7 w-7 text-(--accent-bronze)" />
        <p className="mt-4 text-sm font-semibold">Gửi bản vẽ & hồ sơ báo giá</p>
        <p className="mt-2 text-xs text-(--text-secondary)">
          CAD • PDF • BOQ • Hồ sơ mời thầu
        </p>
        <a
          href={`mailto:${COMPANY_LEGAL_INFO.email}`}
          className="mt-5 inline-flex cursor-pointer items-center gap-2 border border-(--border-bronze-subtle) px-5 py-3 text-xs font-semibold tracking-wider text-(--accent-bronze) uppercase transition-colors hover:bg-(--accent-bronze) hover:text-black"
        >
          <Mail className="h-4 w-4" />
          Gửi email trực tiếp
        </a>
      </div>
      <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/8 pt-5">
        <div>
          <p className="text-[10px] tracking-wider text-(--text-secondary) uppercase">
            Liên hệ điều hành trực tiếp
          </p>
          <p className="font-syne mt-1 text-lg font-bold">Ông Trần Xuân Đông</p>
          <p className="text-xs text-(--accent-bronze)">Giám Đốc Điều Hành</p>
        </div>
        <PhoneCallButton variant="icon-only" />
      </div>
    </div>
  );
};

export default ContactGateB;
