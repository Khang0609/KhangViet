"use client";

import React from "react";
import { DraftingCompass, Mail, Upload } from "lucide-react";
import { useLegalInfo } from "@/components/contexts/LandingContext";
import PhoneCallButton from "../../ui/PhoneCallButton";

export const ContactGateB: React.FC = () => {
  const legal = useLegalInfo();

  return (
    <div className="border-t border-black/8 bg-[#eae5dc]/45 p-6 md:p-10 lg:border-t-0">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-medium tracking-wider text-(--accent-bronze) uppercase">
            Doanh nghiệp & Đối tác
          </span>
          <h3 className="mt-1.5 text-2xl font-semibold tracking-tight text-[#1a1918]">
            Tổng thầu & Chuỗi tập đoàn
          </h3>
        </div>
        <DraftingCompass className="h-7 w-7 text-black/20" />
      </div>
      <p className="mt-3 max-w-lg text-sm leading-6 text-[#625f5a]">
        Tiếp nhận hồ sơ mời thầu, BOQ, bản vẽ CAD và yêu cầu triển khai đồng bộ chuỗi trên toàn quốc.
      </p>

      <div className="relative mt-8 overflow-hidden rounded-xl border border-dashed border-black/15 bg-white/80 p-6 text-center">
        <div className="opacity-60 select-none">
          <Upload className="mx-auto h-6 w-6 text-(--accent-bronze)" />
          <p className="mt-2.5 text-sm font-semibold text-[#1a1918]">
            Gửi tệp bản vẽ & BOQ qua Email
          </p>
          <p className="mt-1 text-xs text-[#625f5a]">CAD • PDF • BOQ • Hồ sơ mời thầu</p>
        </div>
        <a
          href={`mailto:${legal.email}`}
          className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#1a1918] px-5 py-2.5 text-xs font-medium text-white transition-colors hover:bg-(--accent-bronze)"
        >
          <Mail className="h-3.5 w-3.5" />
          {legal.email}
        </a>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-black/8 pt-5">
        <div>
          <p className="text-xs text-[#625f5a]">Liên hệ điều hành trực tiếp</p>
          <p className="mt-1 text-lg font-semibold text-[#1a1918]">Ông {legal.director}</p>
          <p className="text-xs font-medium text-(--accent-bronze)">Giám Đốc Điều Hành</p>
        </div>
        <PhoneCallButton variant="icon-only" phoneNumber={legal.hotline} className="rounded-full text-white" />
      </div>
    </div>
  );
};

export default ContactGateB;
