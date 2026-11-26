import React from "react";
import type { Metadata } from "next";
import SiteHeader from "@/components/shared/SiteHeader";
import SplitViewExplorer from "@/components/gallery/SplitViewExplorer";
import { getProjectGalleryData } from "@/services/galleryService";
import { resolveGalleryClusters } from "@/lib/galleryClusters";

interface SolutionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const data = await getProjectGalleryData();
  const { solutionClusters } = resolveGalleryClusters(data);
  return solutionClusters.map((c) => ({ slug: c.config.slug }));
}

export async function generateMetadata({
  params,
}: SolutionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProjectGalleryData();
  const { solutionClusters } = resolveGalleryClusters(data);
  const cluster = solutionClusters.find((c) => c.config.slug === slug);

  return {
    title: cluster
      ? `${cluster.config.title} — Giải Pháp Kỹ Thuật | Khang Việt Design`
      : "Giải Pháp Kỹ Thuật | Khang Việt Design",
    description:
      cluster?.config.description ??
      "Tổng hợp công trình thực tế theo hạng mục giải pháp kỹ thuật của Khang Việt Design.",
  };
}

export default async function SolutionProjectsPage({
  params,
}: SolutionPageProps) {
  const { slug } = await params;
  const data = await getProjectGalleryData();

  return (
    <>
      <SiteHeader />
      <SplitViewExplorer data={data} groupType="solution" slug={slug} />
      <footer className="border-t border-black/8 bg-[#181715] py-8 text-center text-xs text-white/60">
        © {new Date().getFullYear()} Khang Việt Design Co., Ltd — Xưởng sản xuất
        trực tiếp tại Bình Tân, TP.HCM.
      </footer>
    </>
  );
}
