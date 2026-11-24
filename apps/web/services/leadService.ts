import type { CreateLeadDto, Lead } from "@khangviet/types";
import { apiClient, type ApiResult } from "@/lib/apiClient";

export async function createLead(
  payload: CreateLeadDto
): Promise<ApiResult<Lead, string>> {
  return apiClient<Lead>("/api/v1/leads", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
