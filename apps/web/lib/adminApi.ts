import type {
  CreateGalleryProjectInput,
  FeaturedProject,
  GalleryClusterConfig,
  LoginCredentials,
  LoginResponseData,
  SafeUser,
} from "@khangviet/types";
import { apiClient, type ApiResult } from "./apiClient";

const TOKEN_STORAGE_KEY = "kv_admin_access_token";
const USER_STORAGE_KEY = "kv_admin_user";

export interface AdminSession {
  accessToken: string;
  user: SafeUser;
}

export function getStoredAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  const accessToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  const rawUser = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!accessToken || !rawUser) return null;
  try {
    const user = JSON.parse(rawUser) as SafeUser;
    return { accessToken, user };
  } catch {
    return null;
  }
}

export function saveAdminSession(session: AdminSession): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_STORAGE_KEY, session.accessToken);
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(session.user));
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(USER_STORAGE_KEY);
}

function getAuthHeaders(): Record<string, string> {
  const session = getStoredAdminSession();
  return session?.accessToken
    ? { Authorization: `Bearer ${session.accessToken}` }
    : {};
}

export async function loginAdmin(
  credentials: LoginCredentials
): Promise<ApiResult<LoginResponseData, string>> {
  const res = await apiClient<{ success: true; data: LoginResponseData }>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify(credentials),
    }
  );
  if (!res.success) return res;
  const payload = res.data.data;
  saveAdminSession({
    accessToken: payload.accessToken,
    user: payload.user,
  });
  return { success: true, data: payload };
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
  const res = await apiClient<{
    success: true;
    pending: boolean;
    data: FeaturedProject;
  }>("/api/v1/admin/cms/projects", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.success) return res;
  return { success: true, data: res.data.data };
}

export async function updateAdminProject(
  id: string,
  input: CreateGalleryProjectInput
): Promise<ApiResult<FeaturedProject, string>> {
  const payload = mapGalleryInputToFeaturedPayload({ ...input, id });
  const res = await apiClient<{
    success: true;
    pending: boolean;
    data: FeaturedProject;
  }>(`/api/v1/admin/cms/projects/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.success) return res;
  return { success: true, data: res.data.data };
}

export async function deleteAdminProject(
  id: string
): Promise<ApiResult<boolean, string>> {
  const res = await apiClient<{ success: true }>(`/api/v1/admin/cms/projects/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.success) return res;
  return { success: true, data: true };
}

export async function updateAdminGalleryClusters(
  clusters: GalleryClusterConfig[]
): Promise<ApiResult<GalleryClusterConfig[], string>> {
  const res = await apiClient<{
    success: true;
    data: GalleryClusterConfig[];
  }>("/api/v1/admin/cms/gallery-clusters", {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ clusters }),
  });
  if (!res.success) return res;
  return { success: true, data: res.data.data };
}
