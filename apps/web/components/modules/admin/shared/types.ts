/**
 * Định nghĩa chuẩn Result Pattern cho tầng Service của CMS Admin.
 * Ràng buộc: Mọi hàm gọi API bất đồng bộ phải trả về kiểu này để caller xử lý lỗi an toàn.
 */
export type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Danh mục các Tab quản trị trong CMS Dashboard.
 */
export type AdminTab = "PROJECTS" | "LEGAL" | "LEADS" | "HERO" | "SYNC";

/**
 * Trạng thái đồng bộ On-demand ISR
 */
export interface AdminSyncState {
  isMidnightWindow: boolean;
  hasPendingChanges: boolean;
  pendingCount: number;
  serverTime: string;
}

