import React from "react";
import type { Metadata } from "next";
import { getProjectGalleryData } from "@/services/galleryService";
import { resolveGalleryClusters } from "@/lib/galleryClusters";
import AdminGallerySlugClient from "@/components/admin/AdminGallerySlugClient";

interface AdminGallerySlugPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const data = await getProjectGalleryData();
  const { partnerClusters, solutionClusters } = resolveGalleryClusters(data);
  return [...partnerClusters, ...solutionClusters].map((c) => ({
    slug: c.config.slug,
  }));
}

export async function generateMetadata({
  params,
}: AdminGallerySlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Chỉnh sửa cụm ${slug} — Admin Studio | Khang Việt Design`,
  };
}

export default async function AdminGallerySlugPage({
  params,
}: AdminGallerySlugPageProps) {
  const { slug } = await params;
  const data = await getProjectGalleryData();
  return <AdminGallerySlugClient initialData={data} slug={slug} />;
}
