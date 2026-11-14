import type {
  GalleryApiResponse,
  ProjectGalleryResponse,
  ProjectListQuery,
} from "@khangviet/types";
import { initialProjectGallery } from "@khangviet/data";
import { apiClient } from "@/lib/apiClient";

/**
 * Lấy dữ liệu trang Project Gallery từ API Gateway (`GET /api/v1/content/gallery`).
 * Hỗ trợ Next.js ISR revalidate và fallback an toàn về @khangviet/data nếu API offline lúc build.
 */
export async function getProjectGalleryData(
  params?: Partial<ProjectListQuery>
): Promise<ProjectGalleryResponse> {
  const searchParams = new URLSearchParams();
  if (params?.segment && params.segment !== "ALL") {
    searchParams.set("segment", params.segment);
  }
  if (params?.stage && params.stage !== "ALL") {
    searchParams.set("stage", params.stage);
  }
  if (params?.categoryTag && params.categoryTag !== "ALL") {
    searchParams.set("categoryTag", params.categoryTag);
  }
  if (params?.keyAccount && params.keyAccount !== "ALL") {
    searchParams.set("keyAccount", params.keyAccount);
  }
  if (params?.search) {
    searchParams.set("search", params.search);
  }
  searchParams.set("page", String(params?.page ?? 1));
  searchParams.set("limit", String(params?.limit ?? 50));

  const queryStr = searchParams.toString();
  const res = await apiClient<GalleryApiResponse>(
    `/api/v1/content/gallery?${queryStr}`,
    {
      next: { revalidate: 60, tags: ["project-gallery"] },
    } as RequestInit
  );

  if (!res.success || !res.data) {
    console.warn(
      `[galleryService] Fallback to @khangviet/data (${res.success ? "empty data" : res.error})`
    );
    return initialProjectGallery;
  }

  return {
    projects: res.data.items,
    keyAccounts: res.data.keyAccounts,
    categories: res.data.categories,
    stats: res.data.stats ?? initialProjectGallery.stats,
  };
}
