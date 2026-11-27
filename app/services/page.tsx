import type { Metadata } from "next";
import { ComingSoonPage } from "@/ui/ComingSoonPage";

export const metadata: Metadata = {
  title: "Dịch vụ của chúng tôi | Khang Việt Design",
  description:
    "Dịch vụ khảo sát, thiết kế kiến trúc – kết cấu, sản xuất và thi công quảng cáo – trang trí nội thất trọn gói tại Khang Việt.",
};

export default function ServicesPage() {
  return (
    <ComingSoonPage
      eyebrow="Đang cập nhật"
      title="Dịch vụ của chúng tôi"
      description="Trang chi tiết các hạng mục thiết kế, gia công cơ khí, bảng hiệu quảng cáo, in ấn và thi công nội thất trọn gói đang được hoàn thiện."
    />
  );
}
