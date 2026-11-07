import type { ContactLead, CreateLeadDto } from "@khangviet/types";
import { apiClient, type ApiResult } from "@/lib/apiClient";

/**
 * Gửi thông tin đăng ký tư vấn / khách hàng tiềm năng lên API Gateway.
 * Sử dụng Result Pattern để UI xử lý feedback lỗi mạng hoặc validation mềm mại.
 * API bảo vệ bằng Rate Limiting 20 req/phút/IP để chống spam form.
 */
export async function createLead(
  payload: CreateLeadDto
): Promise<ApiResult<ContactLead, string>> {
  return apiClient<ContactLead>("/api/v1/leads", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
