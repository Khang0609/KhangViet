import React from "react";
import type { Metadata } from "next";
import { getProjectGalleryData } from "@/services/galleryService";
import AdminProjectsClient from "@/components/admin/AdminProjectsClient";

export const metadata: Metadata = {
  title: "Quản lý Dự án — Admin Studio | Khang Việt Design",
};

export default async function AdminProjectsPage() {
  const data = await getProjectGalleryData();
  return <AdminProjectsClient initialData={data} />;
}
