"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  FolderKanban,
  LayoutGrid,
  Lock,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import KhangVietLogo from "@/ui/KhangVietLogo";
import {
  clearAdminSession,
  getStoredAdminSession,
  loginAdmin,
  type AdminSession,
} from "@/lib/adminApi";

interface AdminShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AdminShell: React.FC<AdminShellProps> = ({
  children,
  title,
  subtitle,
}) => {
  const pathname = usePathname();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [checking, setChecking] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setSession(getStoredAdminSession());
    setChecking(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setSubmitting(true);
    const res = await loginAdmin({ email: email.trim(), password });
    setSubmitting(false);

    if (!res.success) {
      setLoginError(res.error || "Email hoặc mật khẩu không đúng");
      return;
    }

    if (res.data.user.role !== "ADMIN" && res.data.user.role !== "STAFF") {
      clearAdminSession();
      setLoginError("Tài khoản này không có quyền truy cập trang Quản trị.");
      return;
    }

    setSession({
      accessToken: res.data.accessToken,
      user: res.data.user,
    });
  };

  const handleLogout = () => {
    clearAdminSession();
    setSession(null);
    setPassword("");
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f1ea] text-sm text-[#625f5a]">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f4f1ea] px-4 py-12 text-[#1a1918]">
        <div className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-7 shadow-lg sm:p-9">
          <div className="mb-6 flex items-center justify-between">
            <KhangVietLogo compact className="h-9" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#181715] px-3 py-1 text-[11px] font-semibold text-white">
              <Lock className="h-3 w-3 text-(--accent-bronze)" />
              Admin Studio
            </span>
          </div>

          <h1 className="text-xl font-semibold tracking-tight">
            Đăng nhập Quản trị Nội dung
          </h1>
          <p className="mt-1.5 text-xs leading-relaxed text-[#625f5a]">
            Sử dụng tài khoản Quản trị / Nhân sự Khang Việt để thêm dự án và sắp
            xếp bố cục trang Gallery.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#1a1918]">
                Email đăng nhập
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@khangviet.vn"
                className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#1a1918] outline-hidden transition-colors focus:border-(--accent-bronze)"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#1a1918]">
                Mật khẩu
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#1a1918] outline-hidden transition-colors focus:border-(--accent-bronze)"
              />
            </div>

            {loginError && (
              <div className="rounded-xl border border-red-500/25 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full cursor-pointer rounded-xl bg-[#181715] py-3 text-sm font-semibold text-white transition-colors hover:bg-(--accent-bronze) disabled:opacity-60"
            >
              {submitting ? "Đang xác thực..." : "Đăng nhập vào Studio"}
            </button>
          </form>

          <div className="mt-6 border-t border-black/8 pt-4 text-center">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#625f5a] hover:text-[#1a1918]"
            >
              <span>Quay lại trang Kho dự án</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      href: "/admin/projects",
      label: "Dự án",
      icon: FolderKanban,
      active: pathname?.startsWith("/admin/projects"),
    },
    {
      href: "/admin/gallery",
      label: "Bố cục Gallery",
      icon: LayoutGrid,
      active: pathname?.startsWith("/admin/gallery"),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f4f1ea] text-[#1a1918]">
      {/* Top Studio Header */}
      <header className="sticky top-0 z-30 border-b border-black/10 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/projects" className="shrink-0">
              <KhangVietLogo compact className="h-8" />
            </Link>
            <span className="hidden rounded-full bg-[#181715] px-2.5 py-0.5 text-[11px] font-semibold text-white sm:inline-flex">
              Studio
            </span>

            <nav className="ml-2 flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      item.active
                        ? "bg-[#181715] text-white"
                        : "text-[#625f5a] hover:bg-black/5 hover:text-[#1a1918]"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/projects"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-full border border-black/12 bg-[#faf9f6] px-3 py-1.5 text-xs font-medium text-[#1a1918] transition-colors hover:border-[#1a1918] sm:inline-flex"
            >
              <span>Xem Gallery</span>
              <ExternalLink className="h-3 w-3" />
            </Link>

            <div className="hidden items-center gap-1.5 rounded-full border border-black/10 px-3 py-1 text-xs text-[#625f5a] md:inline-flex">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span className="max-w-32 truncate">{session.user.info.name}</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Đăng xuất"
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-black/12 bg-white px-3 py-1.5 text-xs font-medium text-[#625f5a] transition-colors hover:border-red-500/40 hover:text-red-600"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Thoát</span>
            </button>
          </div>
        </div>
      </header>

      {(title || subtitle) && (
        <div className="border-b border-black/8 bg-white/60 py-5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {title && (
              <h1 className="text-xl font-semibold tracking-tight text-[#1a1918] sm:text-2xl">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-1 text-xs text-[#625f5a] sm:text-sm">{subtitle}</p>
            )}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default AdminShell;
