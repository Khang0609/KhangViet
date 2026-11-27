import type { Metadata } from "next";
import { ComingSoonPage } from "@/ui/ComingSoonPage";

export const metadata: Metadata = {
  title: "Về Khang Việt | Khang Việt Design",
  description:
    "Thông tin về Công ty TNHH Thiết Kế Quảng Cáo Trang Trí Nội Thất Khang Việt — thành lập từ năm 2009.",
};

export default function AboutPage() {
  return (
    <ComingSoonPage
      eyebrow="Đang cập nhật"
      title="Về Khang Việt"
      description="Trang giới thiệu chi tiết về hành trình từ năm 2009, đội ngũ và năng lực xưởng sản xuất của Khang Việt đang được hoàn thiện."
    />
  );
}
