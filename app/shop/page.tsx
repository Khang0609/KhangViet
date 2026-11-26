import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import SiteHeader from "@/components/shared/SiteHeader";

export const metadata: Metadata = {
  title: "Cửa Hàng (Sắp Ra Mắt) | Khang Việt Design",
  description:
    "Khu vực đặt mua sản phẩm bảng hiệu, hộp đèn và vật phẩm nhận diện thương hiệu trực tuyến của Khang Việt Design.",
};

export default function ShopComingSoonPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-screen flex-col items-center justify-center bg-(--bg-obsidian) px-5 pt-20 text-center text-white">
        <div className="max-w-md rounded-2xl border border-white/8 bg-(--bg-surface) p-8 shadow-2xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-brand/30 bg-brand/15 text-brand">
            <ShoppingBag className="h-7 w-7" />
          </div>

          <span className="font-mono-tech text-[10px] tracking-widest text-brand uppercase">
            Coming Soon
          </span>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
            Cửa Hàng Đang Hoàn Thiện
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Hệ thống đặt hàng trực tuyến các mẫu bảng hiệu, hộp đèn và vật phẩm
            quảng cáo tiêu chuẩn từ xưởng Khang Việt sẽ sớm ra mắt.
          </p>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-zinc-200 transition-colors hover:bg-zinc-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Về Trang chủ
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-brand/90"
            >
              Xem Kho dự án
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
