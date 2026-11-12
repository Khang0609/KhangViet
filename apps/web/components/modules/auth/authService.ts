import { getApiBaseUrl, type ApiResult } from "@/lib/apiClient";
import type { LoginCredentials, LoginResponseData } from "@khangviet/types";

/**
 * Gửi yêu cầu xác thực người dùng đến backend qua POST /api/auth/login.
 * Kèm thông tin cookie credentials để nhận session_id HttpOnly an toàn.
 * Tuyệt đối không lưu token vào localStorage để ngăn chặn tấn công XSS.
 */
export async function authenticateUser(
  credentials: LoginCredentials
): Promise<ApiResult<LoginResponseData>> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(credentials),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.success) {
      const errMsg =
        json?.error || json?.message || "Email hoặc mật khẩu không chính xác.";
      return { success: false, error: errMsg };
    }

    const data = json.data as LoginResponseData;

    return { success: true, data };
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Không thể kết nối đến máy chủ";
    return { success: false, error: msg };
  }
}

/**
 * Đăng xuất người dùng: Gọi backend hủy session D1 và xóa cookie phiên làm việc,
 * sau đó chuyển hướng an toàn về trang đăng nhập.
 */
export async function logoutUser(): Promise<void> {
  try {
    const baseUrl = getApiBaseUrl();
    await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (err) {
    console.error("Lỗi khi đăng xuất:", err);
  } finally {
    window.location.href = "/login";
  }
}

