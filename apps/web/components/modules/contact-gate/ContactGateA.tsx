"use client";

import React, { FormEvent, useState } from "react";
import { Building2, Check, Send } from "lucide-react";
import PhoneCallButton from "../../ui/PhoneCallButton";

export const ContactGateA: React.FC = () => {
  const [formSent, setFormSent] = useState(false);

  const submitContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormSent(true);
    event.currentTarget.reset();
  };

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
        Gửi nhanh nhu cầu. Kỹ thuật Khang Việt sẽ liên hệ khảo sát và tư vấn vật
        liệu phù hợp trong giờ làm việc.
      </p>

      {formSent ? (
        <div className="mt-8 flex min-h-64 flex-col items-center justify-center border border-(--border-bronze-subtle) bg-(--accent-bronze)/5 p-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-(--accent-bronze) text-black">
            <Check className="h-6 w-6" />
          </span>
          <h4 className="font-syne mt-5 text-xl font-bold">
            Đã ghi nhận yêu cầu
          </h4>
          <p className="mt-2 text-sm text-(--text-secondary)">
            Khang Việt sẽ liên hệ với bạn trong thời gian sớm nhất.
          </p>
          <button
            type="button"
            onClick={() => setFormSent(false)}
            className="mt-5 cursor-pointer text-xs tracking-wider text-(--accent-bronze) uppercase"
          >
            Gửi yêu cầu khác
          </button>
        </div>
      ) : (
        <form onSubmit={submitContact} className="mt-8 space-y-3">
          <label className="block">
            <span className="sr-only">Họ và tên</span>
            <input
              required
              name="name"
              placeholder="01. HỌ VÀ TÊN"
              className="w-full border border-white/10 bg-white/2.5 px-4 py-4 text-sm outline-hidden transition-colors placeholder:text-white/30 focus:border-(--accent-bronze)"
            />
          </label>
          <label className="block">
            <span className="sr-only">Số điện thoại</span>
            <input
              required
              type="tel"
              name="phone"
              placeholder="02. SỐ ĐIỆN THOẠI"
              className="w-full border border-white/10 bg-white/2.5 px-4 py-4 text-sm outline-hidden transition-colors placeholder:text-white/30 focus:border-(--accent-bronze)"
            />
          </label>
          <label className="block">
            <span className="sr-only">Nhu cầu thi công</span>
            <textarea
              required
              name="request"
              rows={3}
              placeholder="03. NHU CẦU THI CÔNG / ĐỊA ĐIỂM"
              className="w-full resize-none border border-white/10 bg-white/2.5 px-4 py-4 text-sm outline-hidden transition-colors placeholder:text-white/30 focus:border-(--accent-bronze)"
            />
          </label>
          <button
            type="submit"
            className="flex w-full cursor-pointer items-center justify-between bg-(--accent-bronze) px-5 py-4 text-xs font-bold tracking-wider text-black uppercase transition-colors hover:bg-(--accent-bronze-light)"
          >
            Gửi yêu cầu khảo sát
            <Send className="h-4 w-4" />
          </button>
        </form>
      )}
      <div className="mt-4">
        <PhoneCallButton
          variant="outline"
          label="Gọi ngay / Zalo: 0903 680 449"
          className="w-full py-3"
        />
      </div>
    </div>
  );
};

export default ContactGateA;
