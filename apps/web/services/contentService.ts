import type { LandingContent } from "@khangviet/types";
import { initialLandingContent } from "@khangviet/data";

const DEFAULT_API_URL = "http://127.0.0.1:8787";

export async function getLandingContent(): Promise<LandingContent> {
  const apiUrl =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    DEFAULT_API_URL;

  try {
    const res = await fetch(`${apiUrl}/api/v1/content/landing`, {
      next: {
        tags: ["cms-landing"],
        revalidate: 86400, // 24 giờ dự phòng cho ISR
      },
    });

    if (!res.ok) {
      console.warn(`[ContentService] API returned ${res.status}, using fallback seed data`);
      return initialLandingContent;
    }

    const json = await res.json();
    if (json?.success && json?.data) {
      return json.data as LandingContent;
    }

    return initialLandingContent;
  } catch (error) {
    console.warn(
      "[ContentService] Failed to fetch CMS content from API, falling back to seed data:",
      (error as Error).message
    );
    return initialLandingContent;
  }
}

