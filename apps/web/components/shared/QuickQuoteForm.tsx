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
        placeholder="Họ và tên"
        disabled={isSubmitting}
        className="w-full rounded-xl border border-black/12 bg-[#f4f1ea]/50 px-4 py-3.5 text-sm text-[#1a1918] outline-hidden transition-colors placeholder:text-[#625f5a]/70 focus:border-(--accent-bronze) focus:bg-white disabled:opacity-50"
      />
      <input
        required
        type="tel"
        name="phone"
        placeholder="Số điện thoại"
        disabled={isSubmitting}
        className="w-full rounded-xl border border-black/12 bg-[#f4f1ea]/50 px-4 py-3.5 text-sm text-[#1a1918] outline-hidden transition-colors placeholder:text-[#625f5a]/70 focus:border-(--accent-bronze) focus:bg-white disabled:opacity-50"
      />
      <textarea
        required
        name="request"
        rows={3}
        defaultValue={defaultRequestText}
        placeholder="Nhu cầu thi công / địa điểm dự kiến"
        disabled={isSubmitting}
        className="w-full resize-none rounded-xl border border-black/12 bg-[#f4f1ea]/50 px-4 py-3.5 text-sm text-[#1a1918] outline-hidden transition-colors placeholder:text-[#625f5a]/70 focus:border-(--accent-bronze) focus:bg-white disabled:opacity-50"
      />
      {errorMessage && <p className="text-xs text-red-600">{errorMessage}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full cursor-pointer items-center justify-between rounded-full bg-[#1a1918] px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-(--accent-bronze) disabled:opacity-60"
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
