import React from "react";
import type { Metadata } from "next";
import SiteHeader from "@/components/shared/SiteHeader";
import SplitViewExplorer from "@/components/gallery/SplitViewExplorer";
import { getProjectGalleryData } from "@/services/galleryService";
import { resolveGalleryClusters } from "@/lib/galleryClusters";

interface PartnerPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const data = await getProjectGalleryData();
  const { partnerClusters } = resolveGalleryClusters(data);
  return partnerClusters.map((c) => ({ slug: c.config.slug }));
}

export async function generateMetadata({
  params,
}: PartnerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProjectGalleryData();
  const { partnerClusters } = resolveGalleryClusters(data);
  const cluster = partnerClusters.find((c) => c.config.slug === slug);

  return {
    title: cluster
      ? `${cluster.config.title} — Hồ Sơ Đối Tác | Khang Việt Design`
      : "Hồ Sơ Đối Tác | Khang Việt Design",
    description:
      cluster?.config.description ??
      "Hồ sơ công trình thi công thực tế và phối cảnh 2D/3D dành cho đối tác chiến lược của Khang Việt Design.",
  };
}

export default async function PartnerProjectsPage({ params }: PartnerPageProps) {
  const { slug } = await params;
  const data = await getProjectGalleryData();

  return (
    <>
      <SiteHeader />
      <SplitViewExplorer data={data} groupType="partner" slug={slug} />
      <footer className="border-t border-black/8 bg-[#181715] py-8 text-center text-xs text-white/60">
        © {new Date().getFullYear()} Khang Việt Design Co., Ltd — Xưởng sản xuất
        trực tiếp tại Bình Tân, TP.HCM.
      </footer>
    </>
  );
}
