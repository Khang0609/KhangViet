import { Result } from "./types";

const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8787";
};

/**
 * Client gọi API an toàn theo chuẩn Result Pattern.
 * Đảm bảo bắt mọi ngoại lệ mạng hoặc định dạng JSON mà không throw error ra UI.
 */
export async function adminRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<Result<T, string>> {
  try {
    const url = `${getBaseUrl()}${path}`;
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    const res = await fetch(url, { ...options, headers });
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

