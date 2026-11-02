import type { LandingContent } from "@khangviet/types";
import { initialLandingContent } from "@khangviet/data";
import { apiClient } from "@/lib/apiClient";

export async function getLandingContent(): Promise<LandingContent> {
  const result = await apiClient<LandingContent>("/api/v1/content/landing", {
    next: {
      tags: ["cms-landing"],
      revalidate: 86400, // 24 giờ dự phòng cho ISR
    },
  });

  if (result.success) {
    return result.data;
  }

  console.warn(
    "[ContentService] API không phản hồi hợp lệ, dùng dữ liệu mẫu fallback:",
    result.error,
  );
  return initialLandingContent;
}
