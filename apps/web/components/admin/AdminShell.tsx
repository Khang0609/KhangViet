"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ExternalLink,
  FolderKanban,
  Home,
  MessageSquareText,
  ShieldAlert,
} from "lucide-react";
import KhangVietLogo from "@/ui/KhangVietLogo";
import { getAdminMe, type AdminSession } from "@/lib/adminApi";

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

  useEffect(() => {
    let active = true;
    getAdminMe()
      .then((res) => {
        if (!active) return;
        if (
          res.success &&
          (res.data.user.role === "ADMIN" || res.data.user.role === "STAFF")
        ) {
          setSession({ user: res.data.user });
        } else {
          setSession(null);
        }
      })
      .catch(() => {
        if (active) setSession(null);
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f1ea] text-sm text-[#625f5a]">
        Đang xác thực quyền truy cập...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f4f1ea] px-4 py-12 text-[#1a1918]">
        <div className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-7 text-center shadow-lg sm:p-9">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            Không có quyền truy cập
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-[#625f5a]">
            Phiên làm việc chưa được cấp quyền qua Cloudflare Access hoặc tài
            khoản không thuộc danh sách nhân sự Khang Việt.
          </p>
          <div className="mt-6">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#181715] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-(--accent-bronze)"
            >
              <span>Quay lại trang Kho dự án</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      href: "/admin",
      label: "Trang chính",
      icon: Home,
      active: pathname === "/admin" || pathname === "/admin/",
    },
    {
      href: "/admin/projects",
      label: "Dự án",
      icon: FolderKanban,
      active: pathname?.startsWith("/admin/projects"),
    },
    {
      href: "/admin/partners",
      label: "Đối tác",
      icon: Building2,
      active: pathname?.startsWith("/admin/partners"),
    },
    {
      href: "/admin/leads",
      label: "Khách hàng",
      icon: MessageSquareText,
      active: pathname?.startsWith("/admin/leads"),
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
              <span>Xem trang</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
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
