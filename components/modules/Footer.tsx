"use client";

import React from "react";
import Link from "next/link";
import KhangVietLogo from "@/ui/KhangVietLogo";

const PAGE_LINKS_COL_1 = [
  { label: "Trang chủ", href: "/" },
  { label: "Dịch vụ", href: "/services" },
  { label: "Liên hệ", href: "/contact" },
];

const PAGE_LINKS_COL_2 = [
  { label: "Giới thiệu", href: "/about" },
  { label: "Công trình", href: "/projects" },
];

function SageCornerFillet() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="pointer-events-none h-6 w-6 -translate-x-px translate-y-px -rotate-90"
      aria-hidden="true"
    >
      <path d="M0 0H24C10.745 0 0 10.745 0 24V0Z" fill="#D8DFD4" />
    </svg>
  );
}

export const Footer: React.FC = () => {
  return (
    <footer
      id="lien-he"
      className="w-full scroll-mt-20 bg-[#F7F4E6] px-3 py-5 text-[#2D312C] sm:px-6 sm:py-8"
    >
      {/* MOBILE (< md): Single Unified Sage Card matching Alister mobile footer */}
      <div className="rounded-3xl bg-[#D8DFD4] p-7 md:hidden">
        <h2 className="text-2xl leading-tight font-bold tracking-[-0.03em] text-[#2D312C]">
          Bạn đang ấp ủ dự án nào?
        </h2>
        <div className="mt-1.5">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 border-b-2 border-[#F58633] pb-0.5 text-xl font-bold tracking-[-0.02em] text-[#F58633]"
          >
            Trao đổi ngay
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="my-7 flex justify-center">
          <Link href="/" aria-label="Về trang chủ Khang Việt">
            <KhangVietLogo className="h-10 w-auto" />
          </Link>
        </div>

        <p className="text-sm leading-relaxed text-[#3F443E]">
          Thành lập từ năm 2009 tại TP.HCM, Khang Việt thiết kế, gia công và thi
          công trọn gói bảng hiệu quảng cáo &amp; trang trí nội thất cho các
          thương hiệu lớn.
        </p>

        <div className="mt-7">
          <h3 className="text-xs font-bold tracking-wider text-[#2D312C] uppercase">
            Trang
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm text-[#3F443E]">
            <div className="flex flex-col gap-2.5">
              {PAGE_LINKS_COL_1.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition-colors duration-200 hover:text-[#F58633]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-2.5">
              {PAGE_LINKS_COL_2.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition-colors duration-200 hover:text-[#F58633]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-7">
          <h3 className="text-xs font-bold tracking-wider text-[#2D312C] uppercase">
            Liên hệ
          </h3>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[#3F443E]">
            <a href="mailto:khangvietdesign@gmail.com">
              khangvietdesign@gmail.com
            </a>
            <a href="tel:0903680449">0903 680 449</a>
            <a
              href="https://zalo.me/0903680449"
              target="_blank"
              rel="noopener noreferrer"
            >
              Zalo: 0903 680 449
            </a>
          </div>

          <div className="mt-5">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-md border border-[#F58633] px-5 py-2.5 text-xs font-bold tracking-wider text-[#F58633] uppercase transition-colors duration-200 hover:bg-[#F58633] hover:text-white"
            >
              Liên hệ ngay
            </Link>
          </div>
        </div>
      </div>

      {/* DESKTOP (md+): L-Shaped Sage Card */}
      <div className="hidden w-full md:block">
        {/* Top L-Shape Row: Sage Logo Tab + Cream Headline Cutout */}
        <div className="flex flex-row items-end">
          <div className="flex w-88 shrink-0 items-center rounded-t-3xl bg-[#D8DFD4] px-14 pt-14 pb-10">
            <Link href="/" aria-label="Về trang chủ Khang Việt">
              <KhangVietLogo className="h-12 w-auto" />
            </Link>
          </div>

          <div className="relative flex flex-1 flex-col justify-center bg-[#F7F4E6] px-10 py-12 pl-16">
            <div className="absolute bottom-0 left-0">
              <SageCornerFillet />
            </div>

            <h2 className="text-[clamp(2rem,3.6vw,3.4rem)] leading-[1.1] font-bold tracking-[-0.03em] text-[#2D312C]">
              Bạn đang ấp ủ dự án nào?
            </h2>
            <div className="mt-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border-b-2 border-[#F58633] pb-0.5 text-[clamp(1.75rem,3vw,2.75rem)] font-bold tracking-[-0.02em] text-[#F58633] transition-opacity duration-200 hover:opacity-80"
              >
                Trao đổi ngay
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Sage Footer Body */}
        <div className="rounded-tr-3xl rounded-b-3xl bg-[#D8DFD4] px-14 pt-20 pb-32">
          <div className="grid grid-cols-12 gap-10">
            <div className="col-span-5 flex flex-col justify-between gap-6">
              <p className="max-w-md text-lg leading-relaxed text-[#3F443E]">
                Thành lập từ năm 2009 tại TP.HCM, Khang Việt thiết kế, gia công
                và thi công trọn gói bảng hiệu quảng cáo &amp; trang trí nội
                thất cho các thương hiệu lớn.
              </p>
              <p className="text-sm leading-relaxed text-[#5A6058]">
                687/24/34 Kinh Dương Vương, P. An Lạc, Q. Bình Tân, TP.HCM ·
                MST: 0306794247
              </p>
            </div>

            <div className="col-span-4">
              <h3 className="text-sm font-bold tracking-wider text-[#2D312C] uppercase">
                Trang
              </h3>
              <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3 text-base text-[#3F443E]">
                <div className="flex flex-col gap-3">
                  {PAGE_LINKS_COL_1.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="transition-colors duration-200 hover:text-[#F58633]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
                <div className="flex flex-col gap-3">
                  {PAGE_LINKS_COL_2.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="transition-colors duration-200 hover:text-[#F58633]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-span-3">
              <h3 className="text-sm font-bold tracking-wider text-[#2D312C] uppercase">
                Liên hệ
              </h3>
              <div className="mt-5 flex flex-col gap-3 text-base text-[#3F443E]">
                <a
                  href="mailto:khangvietdesign@gmail.com"
                  className="transition-colors duration-200 hover:text-[#F58633]"
                >
                  khangvietdesign@gmail.com
                </a>
                <a
                  href="tel:0903680449"
                  className="transition-colors duration-200 hover:text-[#F58633]"
                >
                  0903 680 449
                </a>
                <a
                  href="https://zalo.me/0903680449"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors duration-200 hover:text-[#F58633]"
                >
                  Zalo: 0903 680 449
                </a>
              </div>

              <div className="mt-8">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-md border border-[#F58633] px-6 py-3 text-sm font-bold tracking-wider text-[#F58633] uppercase transition-colors duration-200 hover:bg-[#F58633] hover:text-white"
                >
                  Liên hệ ngay
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
