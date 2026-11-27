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
      className="pointer-events-none h-6 w-6 -rotate-90"
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
      className="w-full scroll-mt-20 bg-[#F7F4E6] px-4 py-6 text-[#2D312C] sm:px-6 sm:py-8"
    >
      <div className="w-full">
        {/* Top L-Shape Row: Sage Logo Tab + Cream Headline Cutout */}
        <div className="flex flex-col md:flex-row md:items-end">
          {/* Left Sage Tab */}
          <div className="flex items-center rounded-t-3xl bg-[#D8DFD4] px-10 pt-10 pb-8 sm:px-14 sm:pt-14 sm:pb-10 md:w-88 md:shrink-0">
            <Link href="/" aria-label="Về trang chủ Khang Việt">
              <KhangVietLogo className="h-11 w-auto sm:h-12" />
            </Link>
          </div>

          {/* Right Cream Cutout with Concave Sage Fillet */}
          <div className="relative flex flex-1 flex-col justify-center bg-[#F7F4E6] px-4 py-8 sm:px-10 sm:py-12 md:pl-16">
            <div className="hidden md:block">
              <div className="absolute bottom-0 left-0">
                <SageCornerFillet />
              </div>
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
        <div className="rounded-b-3xl bg-[#D8DFD4] px-10 pt-14 pb-24 sm:px-14 sm:pt-20 sm:pb-32 md:rounded-tr-3xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-10">
            {/* Left: Agency Summary & Address */}
            <div className="flex flex-col justify-between gap-6 md:col-span-5">
              <p className="max-w-md text-base leading-relaxed text-[#3F443E] sm:text-lg">
                Thành lập từ năm 2009 tại TP.HCM, Khang Việt thiết kế, gia công
                và thi công trọn gói bảng hiệu quảng cáo &amp; trang trí nội
                thất cho các thương hiệu lớn.
              </p>
              <p className="text-xs leading-relaxed text-[#5A6058] sm:text-sm">
                687/24/34 Kinh Dương Vương, P. An Lạc, Q. Bình Tân, TP.HCM ·
                MST: 0306794247
              </p>
            </div>

            {/* Middle: Pages */}
            <div className="md:col-span-4">
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

            {/* Right: Contact */}
            <div className="md:col-span-3">
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
                  className="inline-flex items-center justify-center rounded-md border border-[#F58633] px-6 py-3 text-xs font-bold tracking-wider text-[#F58633] uppercase transition-colors duration-200 hover:bg-[#F58633] hover:text-white sm:text-sm"
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
