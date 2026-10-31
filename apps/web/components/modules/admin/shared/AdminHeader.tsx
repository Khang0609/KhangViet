"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, ShieldCheck } from "lucide-react";

/**
 * Header thanh thoát cho trang quản trị Khang Việt.
 * Hiển thị nhận diện thương hiệu, kết nối bảo mật nội bộ và nút về trang Landing Page.
 */
export const AdminHeader: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/8 bg-(--bg-obsidian)/90 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="Khang Việt Design"
            width={120}
            height={32}
            className="h-7 w-auto object-contain"
            priority
          />
        </Link>
        <span className="hidden h-4 w-px bg-white/15 md:inline-block" />
        <div className="hidden items-center gap-2 md:flex">
          <ShieldCheck className="h-4 w-4 text-(--accent-bronze)" />
          <span className="font-mono-tech text-[11px] tracking-widest text-white/70 uppercase">
            CMS Portal
          </span>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden font-mono-tech text-xs text-white/40 sm:block">
          VN Time: <span className="text-white/80">{currentTime}</span>
        </div>

        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 rounded border border-white/10 bg-white/4 px-3 py-1.5 font-mono-tech text-xs text-white/80 transition-colors hover:border-(--accent-bronze) hover:text-white"
        >
          <span>Xem Landing Page</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </header>
  );
};

export default AdminHeader;

