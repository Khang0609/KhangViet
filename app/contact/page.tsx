import type { Metadata } from "next";
import { ComingSoonPage } from "@/ui/ComingSoonPage";

export const metadata: Metadata = {
  title: "Liên hệ | Khang Việt Design",
  description:
    "Liên hệ Công ty TNHH Thiết Kế Quảng Cáo Trang Trí Nội Thất Khang Việt — Hotline 0903 680 449.",
};

export default function ContactPage() {
  return (
    <ComingSoonPage
      eyebrow="Đang cập nhật"
      title="Liên hệ Khang Việt"
      description="Biểu mẫu gửi yêu cầu báo giá trực tuyến đang được hoàn thiện. Quý khách vui lòng liên hệ trực tiếp qua hotline 0903 680 449 hoặc email khangvietdesign@gmail.com."
    />
  );
}
