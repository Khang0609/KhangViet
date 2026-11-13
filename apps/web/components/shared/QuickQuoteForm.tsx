"use client";

import React, { useState, type FormEvent } from "react";
import { Loader2, Send } from "lucide-react";
import { createLead } from "@/services/leadService";
import { ContactSuccessView } from "../modules/contact-gate/ContactSuccessView";

export interface QuickQuoteFormProps {
  serviceCategory?: string;
  defaultRequestText?: string;
  submitLabel?: string;
  className?: string;
  onSuccess?: () => void;
}

export const QuickQuoteForm: React.FC<QuickQuoteFormProps> = ({
  serviceCategory = "Chủ cửa hàng / Showroom",
  defaultRequestText = "",
  submitLabel = "Gửi yêu cầu khảo sát",
  className = "mt-8 space-y-3",
  onSuccess,
}) => {
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
      serviceCategory,
    });

    setIsSubmitting(false);
    if (res.success) {
      setFormSent(true);
      onSuccess?.();
    } else {
      setErrorMessage(
        res.error || "Gửi không thành công. Vui lòng gọi trực tiếp hotline."
      );
    }
  };

  if (formSent) {
    return <ContactSuccessView onReset={() => setFormSent(false)} />;
  }

  return (
    <form onSubmit={submitContact} className={className}>
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
        defaultValue={defaultRequestText}
        placeholder="03. NHU CẦU THI CÔNG / ĐỊA ĐIỂM"
        disabled={isSubmitting}
        className="w-full resize-none border border-white/10 bg-white/2.5 px-4 py-4 text-sm outline-hidden transition-colors placeholder:text-white/30 focus:border-(--accent-bronze) disabled:opacity-50"
      />
      {errorMessage && <p className="text-xs text-red-400">{errorMessage}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full cursor-pointer items-center justify-between bg-(--accent-bronze) px-5 py-4 text-xs font-bold tracking-wider text-black uppercase transition-colors hover:bg-(--accent-bronze-light) disabled:opacity-60"
      >
        {isSubmitting ? "Đang gửi hồ sơ..." : submitLabel}
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </button>
    </form>
  );
};

export default QuickQuoteForm;
