"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  FolderKanban,
  MessageSquareText,
} from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";

export const AdminHomeClient: React.FC = () => {
  return (
    <AdminShell>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Link
          href="/admin/projects"
          className="group flex flex-col justify-between rounded-2xl border border-black/10 bg-white p-6 transition-all hover:border-[#181715] hover:shadow-md"
        >
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#f4f1ea] text-[#181715] transition-colors group-hover:bg-[#181715] group-hover:text-white">
                <FolderKanban className="h-5 w-5" />
              </div>
              <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                Đang hoạt động
              </span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[#1a1918]">
              1. Dự án
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[#625f5a]">
              Quản lý danh sách dự án, hình ảnh thực tế / phối cảnh và gán đối
              tác, hạng mục dịch vụ.
            </p>
          </div>
          <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-(--accent-bronze)">
            <span>Mở Quản lý Dự án</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        <Link
          href="/admin/partners"
          className="group flex flex-col justify-between rounded-2xl border border-black/10 bg-white p-6 transition-all hover:border-[#181715] hover:shadow-md"
        >
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#f4f1ea] text-[#181715] transition-colors group-hover:bg-[#181715] group-hover:text-white">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                Đang hoạt động
              </span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[#1a1918]">
              2. Đối tác &amp; Thương hiệu
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[#625f5a]">
              Quản lý danh sách đối tác, logo thương hiệu hiển thị trên trang chủ
              và bộ lọc dự án.
            </p>
          </div>
          <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-(--accent-bronze)">
            <span>Mở Quản lý Đối tác</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        <Link
          href="/admin/leads"
          className="group flex flex-col justify-between rounded-2xl border border-black/10 bg-white p-6 transition-all hover:border-[#181715] hover:shadow-md"
        >
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#f4f1ea] text-[#181715] transition-colors group-hover:bg-[#181715] group-hover:text-white">
                <MessageSquareText className="h-5 w-5" />
              </div>
              <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                Đang hoạt động
              </span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[#1a1918]">
              3. Yêu cầu tư vấn
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[#625f5a]">
              Theo dõi khách hàng đăng ký báo giá, cập nhật trạng thái và ghi
              chú chăm sóc.
            </p>
          </div>
          <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-(--accent-bronze)">
            <span>Mở Danh sách Khách hàng</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>
    </AdminShell>
  );
};

export default AdminHomeClient;
