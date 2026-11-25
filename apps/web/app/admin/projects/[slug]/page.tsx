import React from "react";
import type { Metadata } from "next";
import { getProjectGalleryData } from "@/services/galleryService";
import AdminProjectMediaClient from "@/components/admin/AdminProjectMediaClient";

interface AdminProjectSlugPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const data = await getProjectGalleryData();
  if (data.projects.length > 0) {
    return data.projects.map((p) => ({ slug: p.slug }));
  }
  return [{ slug: "khang-viet" }];
}

export async function generateMetadata({
  params,
}: AdminProjectSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Ảnh & So sánh 3D (${slug}) | Khang Việt Design`,
  };
}

export default async function AdminProjectSlugPage({
  params,
}: AdminProjectSlugPageProps) {
  const { slug } = await params;
  const data = await getProjectGalleryData();
  return <AdminProjectMediaClient initialProjects={data.projects} slug={slug} />;
}
