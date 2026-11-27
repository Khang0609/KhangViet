import type { Metadata } from "next";
import { ComingSoonPage } from "@/ui/ComingSoonPage";

export const metadata: Metadata = {
  title: "Công trình tiêu biểu | Khang Việt Design",
  description:
    "Danh mục các công trình thiết kế và thi công quảng cáo, bảng hiệu, nội thất tiêu biểu của Khang Việt.",
};

export default function ProjectsPage() {
  return (
    <ComingSoonPage
      eyebrow="Đang cập nhật"
      title="Công trình tiêu biểu"
      description="Thư viện hồ sơ chi tiết từng công trình theo ngành hàng và hạng mục thi công đang được Khang Việt hoàn thiện."
    />
  );
}
