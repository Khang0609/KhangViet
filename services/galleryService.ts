import type { ProjectGalleryResponse } from "@khangviet/types";
import { apiClient } from "@/lib/apiClient";
import { getFallbackGalleryData } from "@/lib/fallbackV2";

export interface GalleryQueryParams {
  serviceSlug?: string;
  organizationSlug?: string;
  search?: string;
}

export async function getProjectGalleryData(
  params?: GalleryQueryParams
): Promise<ProjectGalleryResponse> {
  const searchParams = new URLSearchParams();
  if (params?.serviceSlug) searchParams.set("serviceSlug", params.serviceSlug);
  if (params?.organizationSlug) {
    searchParams.set("organizationSlug", params.organizationSlug);
  }
  if (params?.search) searchParams.set("search", params.search);

  const queryStr = searchParams.toString();
  const path = queryStr
    ? `/api/v1/content/gallery?${queryStr}`
    : "/api/v1/content/gallery";

  const res = await apiClient<ProjectGalleryResponse>(path, {
    next: { revalidate: 60, tags: ["project-gallery"] },
  } as RequestInit);

  if (!res.success || !res.data) {
    console.warn(
      `[galleryService] Fallback (${res.success ? "empty data" : res.error})`
    );
    return getFallbackGalleryData();
  }

  return res.data;
}
