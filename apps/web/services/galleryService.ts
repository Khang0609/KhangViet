import type { ProjectGalleryResponse } from "@khangviet/types";
import { initialProjectGallery } from "@khangviet/data";

/**
 * Cung cấp dữ liệu cho trang Project Gallery từ @khangviet/data.
 */
export async function getProjectGalleryData(): Promise<ProjectGalleryResponse> {
  return initialProjectGallery;
}
