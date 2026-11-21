const DEFAULT_WEB_URL = "http://127.0.0.1:3000";
const DEFAULT_SECRET = "kv-revalidate-secret-2026";

export interface RevalidateOptions {
  tag?: string;
  path?: string;
}

export interface WorkerEnvBindings {
  WEB_APP_URL?: string;
  REVALIDATE_SECRET?: string;
  [key: string]: unknown;
}

/**
 * Gửi webhook revalidation tới Web App (Next.js).
 * Hỗ trợ nhận biến môi trường trực tiếp từ Cloudflare Worker `c.env`.
 * Tự động thử các port local dự phòng (3000, 3001) trong môi trường phát triển nếu cổng chính không phản hồi.
 */
export async function triggerWebRevalidation(
  options: RevalidateOptions = { tag: "cms-landing" },
  env?: WorkerEnvBindings
): Promise<boolean> {
  const configuredUrl =
    (typeof env?.WEB_APP_URL === "string" && env.WEB_APP_URL) ||
    (typeof process !== "undefined" && process.env?.WEB_APP_URL) ||
    DEFAULT_WEB_URL;

  const isProduction =
    env?.NODE_ENV === "production" ||
    env?.ENVIRONMENT === "production" ||
    (typeof process !== "undefined" && process.env?.NODE_ENV === "production");

  const secret =
    (typeof env?.REVALIDATE_SECRET === "string" && env.REVALIDATE_SECRET) ||
    (typeof process !== "undefined" && process.env?.REVALIDATE_SECRET) ||
    (isProduction ? "" : DEFAULT_SECRET);

  if (!secret) {
    throw new Error("FATAL: REVALIDATE_SECRET is not configured in production");
  }

  const params = new URLSearchParams();
  if (options.tag) params.set("tag", options.tag);
  if (options.path) params.set("path", options.path);
  const query = params.toString();

  // Danh sách các URL sẽ thử gửi webhook
  const targetUrls = [configuredUrl];
  if (configuredUrl.includes("127.0.0.1:3000") || configuredUrl.includes("localhost:3000")) {
    targetUrls.push("http://127.0.0.1:3001", "http://localhost:3001");
  }

  for (const baseUrl of targetUrls) {
    const endpoint = `${baseUrl}/api/revalidate${query ? `?${query}` : ""}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-revalidate-secret": secret,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json().catch(() => null);
        console.log(`[ISR Revalidation] Success on ${baseUrl}:`, data);
        return true;
      }
      console.warn(`[ISR Revalidation] Warning: ${baseUrl} replied with status ${res.status}`);
    } catch {
      clearTimeout(timeoutId);
      // Bỏ qua lỗi kết nối để thử endpoint tiếp theo
    }
  }

  console.warn("[ISR Revalidation] Non-fatal: Could not reach any web revalidation endpoint.");
  return false;
}

