import type {
  CreateLeadActivityDto,
  CreateOrganizationDto,
  CreateProjectDto,
  CreateProjectMediaDto,
  GalleryClusterConfig,
  Lead,
  LeadActivity,
  LeadStatus,
  Organization,
  Project,
  ProjectComparison,
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

export async function setAdminProjectComparison(
  projectId: string,
  renderMediaId: string,
  actualMediaId: string
): Promise<ApiResult<ProjectComparison, string>> {
  return await apiClient<ProjectComparison>(
    `/api/v1/admin/cms/projects/${encodeURIComponent(projectId)}/comparison`,
    {
      method: "PUT",
      body: JSON.stringify({ renderMediaId, actualMediaId }),
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

export async function getAdminLeads(params?: {
  status?: LeadStatus;
  search?: string;
}): Promise<ApiResult<Lead[], string>> {
  const sp = new URLSearchParams();
  if (params?.status) sp.set("status", params.status);
  if (params?.search) sp.set("search", params.search);
  const qs = sp.toString();
  return await apiClient<Lead[]>(
    qs ? `/api/v1/admin/leads?${qs}` : "/api/v1/admin/leads",
    { method: "GET" }
  );
}

export async function getAdminLeadById(
  id: string
): Promise<ApiResult<Lead & { activities?: LeadActivity[] }, string>> {
  return await apiClient<Lead & { activities?: LeadActivity[] }>(
    `/api/v1/admin/leads/${encodeURIComponent(id)}`,
    { method: "GET" }
  );
}

export async function updateAdminLeadStatus(
  id: string,
  status: LeadStatus,
  note?: string
): Promise<ApiResult<Lead, string>> {
  return await apiClient<Lead>(
    `/api/v1/admin/leads/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status, note }),
    }
  );
}

export async function addAdminLeadActivity(
  id: string,
  input: CreateLeadActivityDto
): Promise<ApiResult<LeadActivity, string>> {
  return await apiClient<LeadActivity>(
    `/api/v1/admin/leads/${encodeURIComponent(id)}/activities`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

export async function deleteAdminLead(
  id: string
): Promise<ApiResult<{ success: boolean }, string>> {
  return await apiClient<{ success: boolean }>(
    `/api/v1/admin/leads/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
}
