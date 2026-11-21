import type {
  CreateGalleryProjectInput,
  FeaturedProject,
  GalleryClusterConfig,
  LoginCredentials,
  LoginResponseData,
  SafeUser,
} from "@khangviet/types";
import { apiClient, type ApiResult } from "./apiClient";

export interface AdminSession {
  user: SafeUser;
}

export async function getAdminMe(): Promise<ApiResult<SafeUser, string>> {
  return await apiClient<SafeUser>("/api/auth/me", { method: "GET" });
}

export async function logoutAdmin(): Promise<ApiResult<unknown, string>> {
  return await apiClient<unknown>("/api/auth/logout", { method: "POST" });
}

export async function loginAdmin(
  credentials: LoginCredentials
): Promise<ApiResult<LoginResponseData, string>> {
  return await apiClient<LoginResponseData>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

/**
 * Chuyển đổi dữ liệu từ Wizard GalleryProject sang FeaturedProjectSchema cho API /projects
 */
export function mapGalleryInputToFeaturedPayload(
  input: CreateGalleryProjectInput
): Omit<FeaturedProject, "id"> & { id?: string } {
  const code =
    input.code?.trim() ||
    `KV-${String(Date.now()).slice(-4)}`;
  const locations = input.location
    .split("•")
    .map((s) => s.trim())
    .filter(Boolean);
  const materials = input.material
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    id: input.id,
    code,
    title: input.title.trim(),
    subtitle: `${input.category} • ${input.client}`,
    client: input.client.trim(),
    locations: locations.length > 0 ? locations : ["TP. Hồ Chí Minh"],
    year: input.year?.trim() || String(new Date().getFullYear()),
    categoryTag: input.category,
    scaleMetric: input.segment === "B2B" ? "Chuỗi đối tác B2B" : "Khách lẻ C2B",
    materials: materials.length > 0 ? materials : ["Vật liệu tiêu chuẩn Khang Việt"],
    engineeringNotes: [input.team.trim() || "Đội ngũ Khang Việt"],
    summary: input.desc.trim() || input.title.trim(),
    coverImage: input.imgActual,
    focalPoint: input.focalPoint,
    segment: input.segment,
    stage: input.stage,
    keyAccountId: input.keyAccount || null,
    teamAndTimeline: input.team.trim() || "Đội ngũ Khang Việt",
    gallery: [
      {
        id: `${code}-gal-1`,
        src: input.img3D || input.imgActual,
        caption: input.img3D ? "Phối cảnh kỹ thuật 2D/3D" : "Ảnh thực tế công trình",
        location: locations[0] || "TP. Hồ Chí Minh",
        spec: materials[0] || "Tiêu chuẩn Khang Việt",
        aspect: "landscape",
      },
    ],
  };
}

export async function createAdminProject(
  input: CreateGalleryProjectInput
): Promise<ApiResult<FeaturedProject, string>> {
  const payload = mapGalleryInputToFeaturedPayload(input);
  return await apiClient<FeaturedProject>("/api/v1/admin/cms/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminProject(
  id: string,
  input: CreateGalleryProjectInput
): Promise<ApiResult<FeaturedProject, string>> {
  const payload = mapGalleryInputToFeaturedPayload({ ...input, id });
  return await apiClient<FeaturedProject>(
    `/api/v1/admin/cms/projects/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
}

export async function deleteAdminProject(
  id: string
): Promise<ApiResult<boolean, string>> {
  const res = await apiClient<unknown>(
    `/api/v1/admin/cms/projects/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );
  if (!res.success) return res;
  return { success: true, data: true };
}

export async function updateAdminGalleryClusters(
  clusters: GalleryClusterConfig[]
): Promise<ApiResult<GalleryClusterConfig[], string>> {
  return await apiClient<GalleryClusterConfig[]>(
    "/api/v1/admin/cms/gallery-clusters",
    {
      method: "PUT",
      body: JSON.stringify({ clusters }),
    }
  );
}
