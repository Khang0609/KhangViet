const DEFAULT_WEB_URL = "http://127.0.0.1:3000";
const DEFAULT_SECRET = "kv-revalidate-secret-2026";

export interface RevalidateOptions {
  tag?: string;
  path?: string;
}

export async function triggerWebRevalidation(
  options: RevalidateOptions = { tag: "cms-landing" }
): Promise<boolean> {
  const webUrl =
    (typeof process !== "undefined" && process.env?.WEB_APP_URL) ||
    DEFAULT_WEB_URL;
  const secret =
    (typeof process !== "undefined" && process.env?.REVALIDATE_SECRET) ||
    DEFAULT_SECRET;

  const tagParam = options.tag ? `&tag=${encodeURIComponent(options.tag)}` : "";
  const pathParam = options.path ? `&path=${encodeURIComponent(options.path)}` : "";
  const endpoint = `${webUrl}/api/revalidate?secret=${encodeURIComponent(secret)}${tagParam}${pathParam}`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.warn(`[ISR Revalidation] Warning: Web replied with status ${res.status}`);
      return false;
    }

    const data = await res.json();
    console.log("[ISR Revalidation] Success:", data);
    return true;
  } catch (err) {
    // Không ném lỗi ra ngoài để tránh làm fail transaction của CMS nếu web server chưa chạy
    console.warn("[ISR Revalidation] Non-fatal: Webhook call failed", (err as Error).message);
    return false;
  }
}

