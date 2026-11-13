"use client";

import React from "react";
import { Building2 } from "lucide-react";
import PhoneCallButton from "../../ui/PhoneCallButton";
import { QuickQuoteForm } from "../../shared/QuickQuoteForm";

export const ContactGateA: React.FC = () => {
  return (
    <div className="p-6 md:p-10 lg:border-r lg:border-white/8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="font-mono-tech text-[9px] tracking-widest text-(--accent-bronze) uppercase">
            Contact gate A
          </span>
          <h3 className="font-syne mt-2 text-2xl font-bold">
            Chủ cửa hàng / Showroom
          </h3>
        </div>
        <Building2 className="h-8 w-8 text-white/15" />
      </div>
      <p className="mt-4 max-w-lg text-sm leading-6 text-(--text-secondary)">
        Gửi nhanh nhu cầu. Kỹ thuật Khang Việt sẽ liên hệ khảo sát và tư vấn
        vật liệu trong giờ làm việc.
      </p>

      <QuickQuoteForm serviceCategory="Chủ cửa hàng / Showroom" />

      <div className="mt-4">
        <PhoneCallButton variant="outline" className="w-full py-3" />
      </div>
    </div>
  );
};

export default ContactGateA;
