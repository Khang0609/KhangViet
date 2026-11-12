import { apiClient } from "@/lib/apiClient";
import type { Result } from "./types";

/**
 * Re-export wrapper tương thích ngược cho Admin CMS.
 * Sử dụng Session Cookie HttpOnly tự động, không còn phụ thuộc vào localStorage hay Bearer header.
 */
export async function adminRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<Result<T, string>> {
  return apiClient<T>(path, {
    ...options,
    credentials: "include",
  });
}

