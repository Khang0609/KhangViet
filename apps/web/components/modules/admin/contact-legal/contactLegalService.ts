import type { CompanyLegalInfo, LandingContent } from "@khangviet/types";
import { adminRequest } from "../shared/adminClient";
import type { Result } from "../shared/types";

/**
 * Lấy thông tin pháp lý và liên lạc hiện tại từ Landing Content
 */
export async function getCompanyLegalInfo(): Promise<Result<CompanyLegalInfo>> {
  const res = await adminRequest<LandingContent>("/api/v1/content/landing");
  if (!res.success) return res;
  return { success: true, data: res.data.companyLegalInfo };
}

/**
 * Cập nhật thông tin pháp lý và liên lạc qua Admin CMS API
 */
export async function updateCompanyLegalInfo(
  info: CompanyLegalInfo
): Promise<Result<unknown>> {
  return adminRequest("/api/v1/admin/cms/legal", {
    method: "PUT",
    body: JSON.stringify(info),
  });
}

