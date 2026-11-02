import React from "react";
import { AdminDashboardContainer } from "@/components/modules/admin";

/**
 * Server Component cho trang quản trị Admin CMS.
 * Tối ưu hóa render phía server (RSC), ủy quyền tương tác client cho AdminDashboardContainer.
 */
export default function AdminPage() {
  return <AdminDashboardContainer />;
}
