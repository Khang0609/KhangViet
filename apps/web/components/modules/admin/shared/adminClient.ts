import { apiClient } from "@/lib/apiClient";
import type { Result } from "./types";

/**
 * Re-export wrapper tương thích ngược cho Admin CMS.
 * Ủy quyền trực tiếp cho lib/apiClient để đảm bảo nguyên tắc DRY.
 */
export async function adminRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<Result<T, string>> {
  return apiClient<T>(path, options);
}
