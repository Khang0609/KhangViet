import React from "react";
import type { Metadata } from "next";
import { AdminHeader } from "@/components/modules/admin/shared/AdminHeader";
import { SyncStatusBar } from "@/components/modules/admin/sync/SyncStatusBar";

export const metadata: Metadata = {
  title: "Khang Việt Design - CMS Quản Trị Nội Dung",
  description: "Bảng điều khiển quản trị thông tin liên lạc, dự án và leads của Khang Việt Architecture & Construction.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-(--bg-obsidian) text-(--text-primary)">
      <AdminHeader />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <SyncStatusBar />
        {children}
      </div>
    </div>
  );
}

