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
  const result = await apiClient<LoginResponseData>("/api/auth/login", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(credentials),
  });

  if (result.success) {
    if (typeof window !== "undefined") {
      localStorage.setItem("kv_access_token", result.data.accessToken);
      localStorage.setItem("kv_user", JSON.stringify(result.data.user));
    }
  }

  return result;
}
