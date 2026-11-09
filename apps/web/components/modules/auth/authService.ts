import { apiClient, type ApiResult } from "@/lib/apiClient";
import type { LoginCredentials, LoginResponseData } from "@khangviet/types";

/**
 * Gửi yêu cầu xác thực người dùng đến backend qua POST /api/auth/login.
 * Kèm thông tin cookie credentials để nhận refreshToken HttpOnly an toàn.
 * Lưu accessToken và thông tin user vào localStorage phục vụ các phiên làm việc tiếp theo.
 */
export async function authenticateUser(
  credentials: LoginCredentials
): Promise<ApiResult<LoginResponseData>> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.success) {
      const errMsg =
        json?.error || json?.message || "Email hoặc mật khẩu không chính xác.";
      return { success: false, error: errMsg };
    }

    const data = json.data as LoginResponseData;

    if (typeof window !== "undefined") {
      localStorage.setItem("kv_access_token", data.accessToken);
      localStorage.setItem("kv_user", JSON.stringify(data.user));
    }

    return { success: true, data };
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Không thể kết nối đến máy chủ";
    return { success: false, error: msg };
  }
}
