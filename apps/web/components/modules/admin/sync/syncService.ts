import type { SyncStatus, ApplyPendingResult } from "@khangviet/types";
import { adminRequest } from "../shared/adminClient";
import type { Result } from "../shared/types";

/**
 * Lấy trạng thái đồng bộ hiện tại của CMS
 */
export async function getSyncStatus(): Promise<Result<SyncStatus>> {
  return adminRequest<SyncStatus>("/api/v1/admin/cms/sync-status");
}

/**
 * Kích hoạt áp dụng các thay đổi đang chờ và revalidate ISR tức thì
 */
export async function applyPendingChanges(): Promise<Result<ApplyPendingResult>> {
  return adminRequest<ApplyPendingResult>(
    "/api/v1/admin/cms/apply-pending",
    { method: "POST" }
  );
}
