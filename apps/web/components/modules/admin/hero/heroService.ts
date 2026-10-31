import type { HeroSlide, LandingContent } from "@khangviet/types";
import { adminRequest } from "../shared/adminClient";
import type { Result } from "../shared/types";

/**
 * Lấy danh sách Hero Slides hiện tại từ Landing Content
 */
export async function getHeroSlides(): Promise<Result<HeroSlide[]>> {
  const res = await adminRequest<LandingContent>("/api/v1/content/landing");
  if (!res.success) return res;
  return { success: true, data: res.data.heroSlides };
}

/**
 * Cập nhật danh sách các Hero Slides qua Admin API
 */
export async function updateHeroSlides(
  slides: HeroSlide[]
): Promise<Result<unknown>> {
  return adminRequest("/api/v1/admin/cms/hero", {
    method: "PUT",
    body: JSON.stringify({ slides }),
  });
}

