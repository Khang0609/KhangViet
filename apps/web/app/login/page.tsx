import React from "react";
import type { Metadata } from "next";
import { LoginPageView } from "@/components/modules/auth";

export const metadata: Metadata = {
  title: "Đăng nhập | Khang Việt Design",
  description: "Trang đăng nhập hệ thống Khang Việt Architecture & Construction.",
};

export default function LoginPage() {
  return <LoginPageView />;
}
