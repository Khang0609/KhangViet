import { Hono } from "hono";
import type { MediaWorkerEnv } from "../services/types";

export const fileRoute = new Hono<{ Bindings: MediaWorkerEnv }>();

fileRoute.get("/*", async (c) => {
  const fullPath = c.req.path;
  const key = fullPath.replace(/^\/file\//, "").replace(/^\//, "");

  if (!key) {
    return c.json({ success: false, error: { code: "INVALID_KEY", message: "Đường dẫn tệp không hợp lệ" } }, 400);
  }

  const object = await c.env.MEDIA_BUCKET.get(key);
  if (!object) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "Không tìm thấy tệp trong bộ lưu trữ" } }, 404);
  }

  c.header("Content-Type", object.httpMetadata?.contentType || "image/webp");
  c.header("Cache-Control", object.httpMetadata?.cacheControl || "public, max-age=31536000, immutable");
  if (object.httpEtag) c.header("ETag", object.httpEtag);

  return c.body(object.body as unknown as ReadableStream, 200);
});
