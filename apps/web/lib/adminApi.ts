import type {
  CreateOrganizationDto,
  CreateProjectDto,
  CreateProjectMediaDto,
  GalleryClusterConfig,
  Organization,
  Project,
  ProjectMedia,
  UpdateOrganizationDto,
  UpdateProjectDto,
  User,
} from "@khangviet/types";
import { apiClient, type ApiResult } from "./apiClient";

export interface AdminSession {
  user: User;
}

export async function getAdminMe(): Promise<
  ApiResult<{ message: string; user: User }, string>
> {
  return await apiClient<{ message: string; user: User }>("/api/protected", {
    method: "GET",
  });
}

export async function getAdminProjects(): Promise<ApiResult<Project[], string>> {
  return await apiClient<Project[]>("/api/v1/admin/cms/projects", {
    method: "GET",
  });
}

export async function createAdminProject(
  input: CreateProjectDto
): Promise<ApiResult<Project, string>> {
  return await apiClient<Project>("/api/v1/admin/cms/projects", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateAdminProject(
  id: string,
  input: UpdateProjectDto
): Promise<ApiResult<Project, string>> {
  return await apiClient<Project>(
    `/api/v1/admin/cms/projects/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    }
  );
}

export async function deleteAdminProject(
  id: string
): Promise<ApiResult<{ deleted: true; id: string }, string>> {
  return await apiClient<{ deleted: true; id: string }>(
    `/api/v1/admin/cms/projects/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );
}

export async function addAdminProjectMedia(
  projectId: string,
  input: CreateProjectMediaDto
): Promise<ApiResult<ProjectMedia, string>> {
  return await apiClient<ProjectMedia>(
    `/api/v1/admin/cms/projects/${encodeURIComponent(projectId)}/media`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

export async function deleteAdminProjectMedia(
  mediaId: string
): Promise<ApiResult<{ deleted: true; mediaId: string }, string>> {
  return await apiClient<{ deleted: true; mediaId: string }>(
    `/api/v1/admin/cms/media/${encodeURIComponent(mediaId)}`,
    {
      method: "DELETE",
    }
  );
}

export async function getAdminOrganizations(): Promise<
  ApiResult<Organization[], string>
> {
  return await apiClient<Organization[]>("/api/v1/admin/organizations", {
    method: "GET",
  });
}

export async function createAdminOrganization(
  input: CreateOrganizationDto
): Promise<ApiResult<Organization, string>> {
  return await apiClient<Organization>("/api/v1/admin/organizations", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateAdminOrganization(
  id: string,
  input: UpdateOrganizationDto
): Promise<ApiResult<Organization, string>> {
  return await apiClient<Organization>(
    `/api/v1/admin/organizations/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    }
  );
}

export async function deleteAdminOrganization(
  id: string
): Promise<ApiResult<{ deleted: true; id: string }, string>> {
  return await apiClient<{ deleted: true; id: string }>(
    `/api/v1/admin/organizations/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );
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
