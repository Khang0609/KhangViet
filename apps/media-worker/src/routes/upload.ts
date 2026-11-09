import { Hono, type Context } from "hono";
import { MAX_FILE_SIZE_BYTES } from "../config/limits";
import { processImageBuffer } from "../services/image-processor";
import { storeInR2 } from "../services/r2-storage";
import type { MediaWorkerEnv } from "../services/types";

export const uploadRoute = new Hono<{ Bindings: MediaWorkerEnv }>();

async function extractBuffer(c: Context): Promise<{ buffer: Uint8Array; mime: string } | null> {
  const cType = c.req.header("Content-Type") || "";
  if (cType.includes("multipart/form-data")) {
    const body = await c.req.parseBody();
    const file = body.file;
    if (!file || typeof file === "string") return null;
    return { buffer: new Uint8Array(await file.arrayBuffer()), mime: file.type };
  }
  const rawBytes = new Uint8Array(await c.req.arrayBuffer());
  return rawBytes.length > 0 ? { buffer: rawBytes, mime: cType } : null;
}

uploadRoute.post("/", async (c) => {
  try {
    const contentLength = Number(c.req.header("content-length"));
    if (contentLength && contentLength > MAX_FILE_SIZE_BYTES) {
      return c.json({ success: false, error: { code: "FILE_TOO_LARGE", message: "Dung lượng tệp vượt quá giới hạn 10MB" } }, 413);
    }

    const extracted = await extractBuffer(c);
    if (!extracted || extracted.buffer.length === 0) {
      return c.json({ success: false, error: { code: "INVALID_INPUT", message: "Không tìm thấy dữ liệu tệp tải lên" } }, 400);
    }
    if (extracted.buffer.length > MAX_FILE_SIZE_BYTES) {
      return c.json({ success: false, error: { code: "FILE_TOO_LARGE", message: "Dung lượng tệp vượt quá giới hạn 10MB" } }, 413);
    }

    const folder = c.req.query("folder") || "projects";
    const mediaType = c.req.query("media_type") || "GALLERY_IMAGE";
    const origin = new URL(c.req.url).origin;

    const processed = await processImageBuffer(extracted.buffer);
    const result = await storeInR2(c.env, processed, origin, folder, mediaType);

    return c.json({ success: true, data: result }, 200);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Xử lý ảnh thất bại";
    const isUnsupported = msg.includes("Không hỗ trợ") || msg.includes("File quá nhỏ");
    const status = isUnsupported ? 415 : 422;
    return c.json({ success: false, error: { code: isUnsupported ? "UNSUPPORTED_MEDIA_TYPE" : "PROCESSING_ERROR", message: msg } }, status);
  }
});
