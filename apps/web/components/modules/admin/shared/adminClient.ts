import { apiClient } from "@/lib/apiClient";
import type { Result } from "./types";

/**
 * Re-export wrapper tương thích ngược cho Admin CMS.
 * Tự động đính kèm accessToken từ localStorage vào header Authorization (Bearer).
 */
export async function adminRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<Result<T, string>> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("kv_access_token")
      : null;

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return apiClient<T>(path, {
    ...options,
    headers,
  });
}

