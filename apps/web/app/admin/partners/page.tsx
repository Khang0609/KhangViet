import React from "react";
import type { Metadata } from "next";
import AdminPartnersClient from "@/components/admin/AdminPartnersClient";

export const metadata: Metadata = {
  title: "Quản lý Đối tác | Khang Việt Design",
};

export default function AdminPartnersPage() {
  return <AdminPartnersClient />;
}
