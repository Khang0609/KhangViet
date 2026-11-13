import React from "react";
import type { Metadata } from "next";
import SiteHeader from "@/components/shared/SiteHeader";
import ProjectGalleryClient from "@/components/gallery/ProjectGalleryClient";
import { getProjectGalleryData } from "@/services/galleryService";

export const metadata: Metadata = {
  title: "Kho Dự Án & Hồ Sơ Năng Lực | Khang Việt Design",
  description:
    "Tra cứu trực quan toàn bộ dự án đã nghiệm thu thực tế và hồ sơ phối cảnh 2D/3D trúng thầu của Khang Việt Design.",
};

export default async function ProjectsPage() {
  const galleryData = await getProjectGalleryData();

  return (
    <>
      <SiteHeader />
      <ProjectGalleryClient data={galleryData} />
      <footer className="border-t border-white/8 bg-[#090a0c] py-8 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} Khang Việt Design Co., Ltd — Xưởng sản xuất
        trực tiếp tại Bình Tân, TP.HCM.
      </footer>
    </>
  );
}
