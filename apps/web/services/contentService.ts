import type { LandingContent } from "@khangviet/types";
import { initialLandingContent } from "@khangviet/data";
import { apiClient } from "@/lib/apiClient";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Lấy toàn bộ nội dung landing page từ Content API.
 * - Môi trường Dev: Tắt cache hoàn toàn (cache: 'no-store') để phản ánh lập tức mọi thay đổi từ DB/Admin.
 * - Môi trường Prod: Áp dụng On-Demand ISR với tag 'cms-landing' và revalidate 60s dự phòng.
 */
export async function getLandingContent(): Promise<LandingContent> {
  const fetchOptions: RequestInit = isDev
    ? { cache: "no-store" }
    : {
        next: {
          tags: ["cms-landing"],
          revalidate: 60, // 60 giây dự phòng cho ISR production
        },
      };

  const result = await apiClient<LandingContent>(
    "/api/v1/content/landing",
    fetchOptions
  );

  if (result.success) {
    return result.data;
  }

  console.warn(
    "[ContentService] API không phản hồi hợp lệ, dùng dữ liệu mẫu fallback:",
    result.error
  );
  return initialLandingContent;
}
