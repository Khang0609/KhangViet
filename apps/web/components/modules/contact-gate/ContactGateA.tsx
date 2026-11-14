"use client";

import React from "react";
import { Building2 } from "lucide-react";
import PhoneCallButton from "../../ui/PhoneCallButton";
import { QuickQuoteForm } from "../../shared/QuickQuoteForm";

export const ContactGateA: React.FC = () => {
  return (
    <div className="p-6 md:p-10 lg:border-r lg:border-black/8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-medium tracking-wider text-(--accent-bronze) uppercase">
            Khách hàng trực tiếp
          </span>
          <h3 className="mt-1.5 text-2xl font-semibold tracking-tight text-[#1a1918]">
            Chủ cửa hàng & Showroom
          </h3>
        </div>
        <Building2 className="h-7 w-7 text-black/20" />
      </div>
      <p className="mt-3 max-w-lg text-sm leading-6 text-[#625f5a]">
        Gửi nhanh nhu cầu. Kỹ thuật Khang Việt sẽ liên hệ khảo sát và tư vấn
        vật liệu trong giờ làm việc.
      </p>

      <QuickQuoteForm serviceCategory="Chủ cửa hàng / Showroom" />

      <div className="mt-4">
        <PhoneCallButton
          variant="outline"
          className="w-full rounded-full border-black/15 py-3 text-[#1a1918] hover:border-[#1a1918]"
        />
      </div>
    </div>
  );
};

export default ContactGateA;
