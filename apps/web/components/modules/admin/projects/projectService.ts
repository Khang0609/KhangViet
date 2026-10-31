import type { FeaturedProject } from "@khangviet/types";
import { adminRequest } from "../shared/adminClient";
import type { Result } from "../shared/types";

/**
 * Lấy danh sách toàn bộ các dự án từ Content API
 */
export async function getProjects(): Promise<Result<FeaturedProject[]>> {
  return adminRequest<FeaturedProject[]>("/api/v1/content/projects");
}

/**
 * Tạo mới một dự án tiêu biểu
 */
export async function createProject(
  data: FeaturedProject
): Promise<Result<FeaturedProject>> {
  return adminRequest<FeaturedProject>("/api/v1/admin/cms/projects", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Cập nhật thông tin dự án theo ID
 */
export async function updateProject(
  id: string,
  data: FeaturedProject
): Promise<Result<FeaturedProject>> {
  return adminRequest<FeaturedProject>(`/api/v1/admin/cms/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Xóa một dự án theo ID
 */
export async function deleteProject(id: string): Promise<Result<boolean>> {
  return adminRequest<boolean>(`/api/v1/admin/cms/projects/${id}`, {
    method: "DELETE",
  });
}

