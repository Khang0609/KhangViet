import React from "react";
import type { Metadata } from "next";
import AdminHomeClient from "@/components/admin/AdminHomeClient";

export const metadata: Metadata = {
  title: "Quản trị | Khang Việt Design",
};

export default function AdminHomePage() {
  return <AdminHomeClient />;
}
