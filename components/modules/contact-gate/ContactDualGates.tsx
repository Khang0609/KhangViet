"use client";

import React from "react";
import { ArrowUpRight, Mail, MessageCircle, PhoneCall } from "lucide-react";
import { useLegalInfo } from "@/components/contexts/LandingContext";
import { formatPhone, normalizePhone } from "@/lib/phone";
import { SectionHeading } from "../../ui/SectionHeading";

export const ContactDualGates: React.FC = () => {
  const legal = useLegalInfo();
  const normalizedPhone = normalizePhone(legal.hotline);
  const formattedPhone = formatPhone(legal.hotline);
  const zaloHref = `https://zalo.me/${normalizedPhone}`;

  return (
    <section
      id="contact-gate"
      className="scroll-mt-20 border-t border-black/8 bg-[#f4f1ea] py-20 md:py-28"
    >
      <div className="mx-auto max-w-360 px-5 md:px-8 xl:px-12">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              orientation="vertical"
              eyebrow="Liên hệ trực tiếp"
              title="Trao đổi trực tiếp cùng Khang Việt."
              description="Không qua trung gian, không chờ đợi phản hồi tự động. Kết nối trực tiếp với đội ngũ kỹ thuật để khảo sát mặt bằng và tư vấn phương án thi công."
            />

            <div className="mt-10 space-y-4 border-t border-black/10 pt-8 text-sm text-[#625f5a]">
              <div className="flex items-center justify-between">
                <span>1. Khảo sát &amp; đo đạc thực tế</span>
                <span className="font-medium text-[#1a1918]">Trong 24h</span>
              </div>
              <div className="flex items-center justify-between border-t border-black/6 pt-4">
                <span>2. Đề xuất vật liệu &amp; phối cảnh</span>
                <span className="font-medium text-[#1a1918]">
                  Trực tiếp từ xưởng
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 border-t border-black/6 pt-4">
                <span className="shrink-0">3. Xưởng sản xuất</span>
                <span className="text-right font-medium text-[#1a1918]">
                  {legal.factoryAddress}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-6 md:p-10 lg:col-span-7">
            <h3 className="text-xl font-semibold tracking-tight text-[#1a1918]">
              Kênh kết nối nhanh
            </h3>
            <p className="mt-1.5 text-sm text-[#625f5a]">
              Chọn kênh thuận tiện nhất để nhắn tin hoặc gọi trực tiếp cho kỹ sư
              phụ trách.
            </p>

            <div className="mt-8 space-y-3">
              <a
                href={zaloHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-2xl border border-black/10 bg-[#f4f1ea]/55 px-5 py-4 transition-colors hover:border-[#1a1918] hover:bg-[#1a1918] hover:text-white"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-(--accent-bronze) shadow-xs">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-xs font-medium tracking-wider uppercase opacity-65">
                      Zalo
                    </div>
                    <div className="mt-0.5 text-base font-semibold tabular-nums">
                      Nhắn tin Zalo · {formattedPhone}
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 shrink-0 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
              </a>

              <a
                href={`mailto:${legal.email}`}
                className="group flex items-center justify-between rounded-2xl border border-black/10 bg-[#f4f1ea]/55 px-5 py-4 transition-colors hover:border-[#1a1918] hover:bg-[#1a1918] hover:text-white"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-(--accent-bronze) shadow-xs">
                    <Mail className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-xs font-medium tracking-wider uppercase opacity-65">
                      Email
                    </div>
                    <div className="mt-0.5 text-base font-semibold">
                      {legal.email}
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 shrink-0 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
              </a>

              <a
                href={`tel:${normalizedPhone}`}
                className="group flex items-center justify-between rounded-2xl bg-[#1a1918] px-5 py-4 text-white transition-colors hover:bg-(--accent-bronze)"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/12 text-(--accent-bronze) transition-colors group-hover:bg-white group-hover:text-[#1a1918]">
                    <PhoneCall className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-xs font-medium tracking-wider uppercase opacity-75">
                      Số điện thoại / Hotline
                    </div>
                    <div className="mt-0.5 text-base font-semibold tabular-nums">
                      {formattedPhone}
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 shrink-0 opacity-80 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactDualGates;
