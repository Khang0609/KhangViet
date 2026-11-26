import type { LandingContent } from "@khangviet/types";
import { apiClient } from "@/lib/apiClient";
import { getFallbackLandingContent } from "@/lib/fallbackV2";

export async function getLandingContent(): Promise<LandingContent> {
  const res = await apiClient<LandingContent>("/api/v1/content/landing", {
    next: { revalidate: 60, tags: ["landing-content"] },
  } as RequestInit);

  if (!res.success || !res.data) {
    console.warn(
      `[contentService] Fallback (${res.success ? "empty data" : res.error})`
    );
    return getFallbackLandingContent();
  }

  return res.data;
}
