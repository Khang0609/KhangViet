"use client";

import React, { FormEvent, useState } from "react";
import { Building2, Loader2, Send } from "lucide-react";
import PhoneCallButton from "../../ui/PhoneCallButton";
import { ContactSuccessView } from "./ContactSuccessView";
import { createLead } from "@/services/leadService";

export const ContactGateA: React.FC = () => {
  const [formSent, setFormSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submitContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const message = String(formData.get("request") || "").trim();

    const res = await createLead({
      fullName,
      phone,
      message,
      serviceCategory: "Chủ cửa hàng / Showroom",
    });

    setIsSubmitting(false);
    if (res.success) {
      setFormSent(true);
    } else {
      setErrorMessage(res.error || "Gửi không thành công. Vui lòng gọi trực tiếp hotline.");
    }
  };

  return (
    <div className="p-6 md:p-10 lg:border-r lg:border-white/8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="font-mono-tech text-[9px] tracking-widest text-(--accent-bronze) uppercase">
            Contact gate A
          </span>
          <h3 className="font-syne mt-2 text-2xl font-bold">Chủ cửa hàng / Showroom</h3>
        </div>
        <Building2 className="h-8 w-8 text-white/15" />
      </div>
      <p className="mt-4 max-w-lg text-sm leading-6 text-(--text-secondary)">
        Gửi nhanh nhu cầu. Kỹ thuật Khang Việt sẽ liên hệ khảo sát và tư vấn vật liệu trong giờ làm việc.
      </p>

      {formSent ? (
        <ContactSuccessView onReset={() => setFormSent(false)} />
      ) : (
        <form onSubmit={submitContact} className="mt-8 space-y-3">
          <input
            required
            name="name"
            placeholder="01. HỌ VÀ TÊN"
            disabled={isSubmitting}
            className="w-full border border-white/10 bg-white/2.5 px-4 py-4 text-sm outline-hidden transition-colors placeholder:text-white/30 focus:border-(--accent-bronze) disabled:opacity-50"
          />
          <input
            required
            type="tel"
            name="phone"
            placeholder="02. SỐ ĐIỆN THOẠI"
            disabled={isSubmitting}
            className="w-full border border-white/10 bg-white/2.5 px-4 py-4 text-sm outline-hidden transition-colors placeholder:text-white/30 focus:border-(--accent-bronze) disabled:opacity-50"
          />
          <textarea
            required
            name="request"
            rows={3}
            placeholder="03. NHU CẦU THI CÔNG / ĐỊA ĐIỂM"
            disabled={isSubmitting}
            className="w-full resize-none border border-white/10 bg-white/2.5 px-4 py-4 text-sm outline-hidden transition-colors placeholder:text-white/30 focus:border-(--accent-bronze) disabled:opacity-50"
          />
          {errorMessage && (
            <p className="text-xs text-red-400">{errorMessage}</p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full cursor-pointer items-center justify-between bg-(--accent-bronze) px-5 py-4 text-xs font-bold tracking-wider text-black uppercase transition-colors hover:bg-(--accent-bronze-light) disabled:opacity-60"
          >
            {isSubmitting ? "Đang gửi hồ sơ..." : "Gửi yêu cầu khảo sát"}
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      )}

      <div className="mt-4">
        <PhoneCallButton variant="outline" label="Gọi ngay / Zalo: 0903 680 449" className="w-full py-3" />
      </div>
    </div>
  );
};

export default ContactGateA;
