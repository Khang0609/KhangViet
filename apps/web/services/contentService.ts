import type { LandingContent } from "@khangviet/types";
import { initialLandingContent } from "@khangviet/data";
import { apiClient } from "@/lib/apiClient";

/**
 * Lấy nội dung Landing Page (heroSlides & featuredProjects từ landing_placements)
 * qua API Gateway (`GET /api/v1/content/landing`).
 * Hỗ trợ Next.js ISR revalidate và fallback an toàn về @khangviet/data nếu API offline lúc build.
 */
export async function getLandingContent(): Promise<LandingContent> {
  const res = await apiClient<LandingContent>("/api/v1/content/landing", {
    next: { revalidate: 60, tags: ["landing-content"] },
  } as RequestInit);

  if (!res.success || !res.data) {
    console.warn(
      `[contentService] Fallback to @khangviet/data (${res.success ? "empty data" : res.error})`
    );
    return initialLandingContent;
  }

  return res.data;
}
