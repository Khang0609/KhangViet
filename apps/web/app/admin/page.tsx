import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, FolderKanban, LayoutGrid } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Admin Studio | Khang Việt Design",
};

export default function AdminHomePage() {
  return (
    <AdminShell
      title="Khang Việt Admin Studio"
      subtitle="Chọn không gian làm việc phù hợp với tác vụ của bạn."
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Link
          href="/admin/projects"
          className="group flex flex-col justify-between rounded-2xl border border-black/10 bg-white p-6 transition-all hover:border-[#181715] hover:shadow-md"
        >
          <div>
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#f4f1ea] text-[#181715] group-hover:bg-[#181715] group-hover:text-white">
              <FolderKanban className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">
              1. Quản lý &amp; Thêm Dự án hàng loạt
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[#625f5a]">
              Danh sách trực quan kèm Wizard 3 bước để tải
              ảnh, chấm điểm lấy nét và nhập nhiều dự án nối tiếp nhau.
            </p>
          </div>
          <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-(--accent-bronze)">
            <span>Mở Quản lý Dự án</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        <Link
          href="/admin/gallery"
          className="group flex flex-col justify-between rounded-2xl border border-black/10 bg-white p-6 transition-all hover:border-[#181715] hover:shadow-md"
        >
          <div>
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#f4f1ea] text-[#181715] group-hover:bg-[#181715] group-hover:text-white">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">
              2. Sắp xếp Bố cục trang Gallery
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[#625f5a]">
              Quản lý thứ tự các cụm đối tác &amp; giải pháp, đổi kiểu lưới Bento
              và kéo-thả dự án trực tiếp vào từng ô hiển thị.
            </p>
          </div>
          <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-(--accent-bronze)">
            <span>Mở Bố cục Gallery</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>
    </AdminShell>
  );
}
