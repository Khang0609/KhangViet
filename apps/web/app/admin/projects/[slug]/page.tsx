import React from "react";
import type { Metadata } from "next";
import { getProjectGalleryData } from "@/services/galleryService";
import { resolveGalleryClusters } from "@/lib/galleryClusters";
import AdminGallerySlugClient from "@/components/admin/AdminGallerySlugClient";

interface AdminProjectLayoutSlugPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const data = await getProjectGalleryData();
  const { partnerClusters, solutionClusters } = resolveGalleryClusters(data);
  const all = [...partnerClusters, ...solutionClusters];
  if (all.length > 0) {
    return all.map((c) => ({ slug: c.config.slug }));
  }
  return [{ slug: "khang-viet" }];
}

export async function generateMetadata({
  params,
}: AdminProjectLayoutSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Bố cục dự án ${slug} | Khang Việt Design`,
  };
}

export default async function AdminProjectLayoutSlugPage({
  params,
}: AdminProjectLayoutSlugPageProps) {
  const { slug } = await params;
  const data = await getProjectGalleryData();
  return (
    <AdminGallerySlugClient
      initialData={data}
      slug={slug}
      backHref="/admin/projects"
    />
  );
}
