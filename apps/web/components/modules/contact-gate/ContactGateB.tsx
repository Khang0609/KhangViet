"use client";

import React from "react";
import { DraftingCompass, Mail, Upload } from "lucide-react";
import { useLegalInfo } from "@/components/contexts/LandingContext";
import PhoneCallButton from "../../ui/PhoneCallButton";

export const ContactGateB: React.FC = () => {
  const legal = useLegalInfo();

  return (
    <div className="border-t border-white/8 bg-(--bg-surface) p-6 md:p-10 lg:border-t-0">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="font-mono-tech text-[9px] tracking-widest text-(--accent-bronze) uppercase">
            Contact gate B
          </span>
          <h3 className="font-syne mt-2 text-2xl font-bold">Tổng thầu / Chuỗi tập đoàn</h3>
        </div>
        <DraftingCompass className="h-8 w-8 text-white/15" />
      </div>
      <p className="mt-4 max-w-lg text-sm leading-6 text-(--text-secondary)">
        Tiếp nhận hồ sơ mời thầu, BOQ, bản vẽ CAD và yêu cầu triển khai đồng bộ chuỗi trên toàn quốc.
      </p>

      <div className="relative mt-8 overflow-hidden border border-dashed border-white/15 bg-[#111215] p-6 text-center">
        <div className="absolute top-3 right-3 rounded-xs border border-(--accent-bronze)/40 bg-(--accent-bronze)/10 px-2 py-0.5 text-[9px] font-mono-tech tracking-widest text-(--accent-bronze) uppercase">
          Coming soon
        </div>
        <div className="opacity-40 select-none">
          <Upload className="mx-auto h-7 w-7 text-(--accent-bronze)" />
          <p className="mt-3 text-sm font-semibold">Tải lên tệp bản vẽ & BOQ trực tiếp</p>
          <p className="mt-1 text-xs text-(--text-secondary)">CAD • PDF • BOQ • Hồ sơ mời thầu</p>
        </div>
        <p className="mt-4 text-xs text-white/60">
          Cổng upload trực tiếp đang hoàn thiện. Vui lòng gửi email hồ sơ:
        </p>
        <a
          href={`mailto:${legal.email}`}
          className="mt-3 inline-flex cursor-pointer items-center gap-2 border border-(--border-bronze-subtle) px-4 py-2.5 text-xs font-semibold tracking-wider text-(--accent-bronze) uppercase transition-colors hover:bg-(--accent-bronze) hover:text-black"
        >
          <Mail className="h-4 w-4" />
          Gửi email: {legal.email}
        </a>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/8 pt-5">
        <div>
          <p className="text-[10px] tracking-wider text-(--text-secondary) uppercase">Liên hệ điều hành trực tiếp</p>
          <p className="font-syne mt-1 text-lg font-bold">Ông {legal.director}</p>
          <p className="text-xs text-(--accent-bronze)">Giám Đốc Điều Hành</p>
        </div>
        <PhoneCallButton variant="icon-only" phoneNumber={legal.hotline} />
      </div>
    </div>
  );
};

export default ContactGateB;
