import React from "react";
import type { Metadata } from "next";
import { getProjectGalleryData } from "@/services/galleryService";
import AdminGalleryOverviewClient from "@/components/admin/AdminGalleryOverviewClient";

export const metadata: Metadata = {
  title: "Bố cục Gallery — Admin Studio | Khang Việt Design",
};

export default async function AdminGalleryOverviewPage() {
  const data = await getProjectGalleryData();
  return <AdminGalleryOverviewClient initialData={data} />;
}
