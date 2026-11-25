import React from "react";
import type { Metadata } from "next";
import AdminLeadsClient from "@/components/admin/AdminLeadsClient";

export const metadata: Metadata = {
  title: "Khách hàng & Yêu cầu tư vấn | Khang Việt Design",
};

export default function AdminLeadsPage() {
  return <AdminLeadsClient />;
}
