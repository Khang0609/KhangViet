import { Hono } from "hono";
import { MAX_FILE_SIZE_BYTES } from "../config/limits";
import { processImageBuffer } from "../services/image-processor";
import { storeInR2 } from "../services/r2-storage";
import { validateSsrfUrl } from "../services/ssrf-validator";
import type { MediaWorkerEnv } from "../services/types";

export const fetchExternalRoute = new Hono<{ Bindings: MediaWorkerEnv }>();

async function downloadExternalImage(targetUrl: string): Promise<Uint8Array> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "KhangVietMediaWorker/1.0" },
      redirect: "manual",
    });
    if (!res.ok) throw new Error(`FETCH_FAILED: Máy chủ đích phản hồi HTTP ${res.status}`);
    const cType = res.headers.get("Content-Type") || "";
    if (cType && !cType.startsWith("image/") && !cType.includes("octet-stream")) {
      throw new Error(`UNSUPPORTED_TYPE: URL không phải tệp ảnh (${cType})`);
    }
    const cl = Number(res.headers.get("content-length"));
    if (cl && cl > MAX_FILE_SIZE_BYTES) {
      throw new Error("FILE_TOO_LARGE: Dung lượng tệp vượt quá 10MB");
    }
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.length > MAX_FILE_SIZE_BYTES) throw new Error("FILE_TOO_LARGE: Dung lượng tệp vượt quá 10MB");
    return bytes;
  } finally {
    clearTimeout(timeoutId);
  }
}

fetchExternalRoute.post("/", async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    if (!body?.url || typeof body.url !== "string") {
      return c.json({ success: false, error: { code: "INVALID_INPUT", message: "Yêu cầu cung cấp URL ảnh hợp lệ" } }, 400);
    }
    const check = validateSsrfUrl(body.url);
    if (!check.safe) {
      return c.json({ success: false, error: { code: "SSRF_BLOCKED", message: check.reason } }, 400);
    }

    const buffer = await downloadExternalImage(body.url);
    const origin = new URL(c.req.url).origin;
    const processed = await processImageBuffer(buffer);
    const result = await storeInR2(c.env, processed, origin, body.folder || "projects", body.media_type || "GALLERY_IMAGE");

    return c.json({ success: true, data: result }, 200);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Tải ảnh từ URL thất bại";
    const status = msg.includes("FILE_TOO_LARGE") ? 413 : msg.includes("UNSUPPORTED_TYPE") ? 415 : 502;
    return c.json({ success: false, error: { code: "FETCH_FAILED", message: msg } }, status);
  }
});
