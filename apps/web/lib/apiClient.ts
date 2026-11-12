/**
 * Kiểu Result Pattern cho tầng Client và Services
 */
export type ApiResult<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Trả về địa chỉ gốc của máy chủ API, ưu tiên URL nội bộ trong runtime server
 */
export function getApiBaseUrl(): string {
  return (
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8787"
  );
}

/**
 * Kiểm tra URL mục tiêu có phải là API nội bộ của Khang Việt hay không
 * để ngăn chặn Credential Leakage sang các domain ngoài Internet.
 */
function isInternalApiTarget(url: string, baseUrl: string): boolean {
  if (url.startsWith("/")) return true;
  if (url.startsWith(baseUrl)) return true;
  return false;
}

/**
 * Hàm fetch dữ liệu tập trung dùng chung (DRY) cho toàn bộ web application.
 * Đảm bảo bắt mọi ngoại lệ mạng, chuẩn hóa JSON payload và trả về Result Pattern.
 * Bảo mật: Chỉ tự động đính kèm credentials đối với request hướng tới API nội bộ.
 */
export async function apiClient<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResult<T, string>> {
  try {
    const baseUrl = getApiBaseUrl();
    const url = path.startsWith("http") ? path : `${baseUrl}${path}`;
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    // Chỉ đính kèm credentials nếu request thuộc domain nội bộ
    const credentials = isInternalApiTarget(url, baseUrl)
      ? "same-origin"
      : undefined;

    const res = await fetch(url, {
      ...options,
      credentials: options.credentials || credentials,
      headers,
    });
    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const errMsg =
        json?.error ||
        json?.message ||
        `Lỗi hệ thống: Mã phản hồi ${res.status}`;
      return { success: false, error: errMsg };
    }

    const data = json && "data" in json ? (json.data as T) : (json as T);
    return { success: true, data };
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Không thể kết nối đến máy chủ API";
    return { success: false, error: msg };
  }
}

