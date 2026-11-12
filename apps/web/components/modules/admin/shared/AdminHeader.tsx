"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, LogOut } from "lucide-react";
import { logoutUser } from "@/components/modules/auth/authService";

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

        <button
          type="button"
          onClick={() => logoutUser()}
          className="flex cursor-pointer items-center gap-1.5 rounded border border-red-500/30 bg-red-500/10 px-3 py-1.5 font-mono-tech text-xs text-red-400 transition-colors hover:border-red-500/60 hover:bg-red-500/20 hover:text-red-300"
          title="Đăng xuất khỏi hệ thống CMS"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;

