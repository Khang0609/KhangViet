import type { ContactLead, LeadStatus } from "@khangviet/types";
import { adminRequest } from "../shared/adminClient";
import type { Result } from "../shared/types";

/**
 * Lấy danh sách leads theo bộ lọc trạng thái và từ khóa tìm kiếm
 */
export async function getLeads(
  status?: LeadStatus | "ALL",
  search?: string
): Promise<Result<ContactLead[]>> {
  const params = new URLSearchParams();
  if (status && status !== "ALL") params.append("status", status);
  if (search) params.append("search", search);

  const query = params.toString() ? `?${params.toString()}` : "";
  return adminRequest<ContactLead[]>(`/api/v1/admin/leads${query}`);
}

/**
 * Cập nhật trạng thái và ghi chú xử lý của một lead
 */
export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
  notes?: string
): Promise<Result<ContactLead>> {
  return adminRequest<ContactLead>(`/api/v1/admin/leads/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, notes }),
  });
}

/**
 * Xóa một lead khỏi hệ thống
 */
export async function deleteLead(id: string): Promise<Result<boolean>> {
  return adminRequest<boolean>(`/api/v1/admin/leads/${id}`, {
    method: "DELETE",
  });
}

