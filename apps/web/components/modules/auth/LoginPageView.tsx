import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import KhangVietLogo from "@/ui/KhangVietLogo";
import { LoginForm } from "./LoginForm";

/**
 * Giao diện trang Đăng nhập theo phong cách kiến trúc cao cấp của Khang Việt Design.
 * Tận dụng lưới bản vẽ kỹ thuật (blueprint-grid) và các sắc độ Obsidian, Amber.
 */
export function LoginPageView() {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center px-4 py-12 bg-(--bg-obsidian) bg-blueprint-grid">
      <div className="absolute inset-0 bg-radial from-transparent via-(--bg-obsidian)/60 to-(--bg-obsidian) pointer-events-none" />

      <div className="relative w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center space-y-3">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 text-xs text-(--text-secondary) hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Trang chủ</span>
          </Link>

          <KhangVietLogo className="h-12" />
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-(--text-primary)">
              Hệ Thống Đăng Nhập
            </h1>
            <p className="text-xs text-(--text-secondary)">
              Không gian quản trị & điều hành Khang Việt Design
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-(--bg-surface) p-6 sm:p-8 shadow-2xl backdrop-blur-md amber-frame-glow">
          <LoginForm />
        </div>

        <p className="text-center text-xs text-(--text-secondary)/60">
          © {new Date().getFullYear()} Khang Việt Architecture & Construction.
        </p>
      </div>
    </div>
  );
}
