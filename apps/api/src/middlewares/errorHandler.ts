import { Context } from "hono";

/**
 * Global Error Handler với Tracing Context và che giấu stack trace (SEC-06).
 */
export const errorHandler = async (err: Error, c: Context) => {
  // Bắt lỗi Content-Type không được hỗ trợ
  if (
    err.message.includes("Unsupported Media Type") ||
    err.message.includes("Content-Type")
  ) {
    return c.json(
      { success: false, error: "Unsupported Media Type" },
      415
    );
  }

  // Bắt lỗi cú pháp JSON
  if (
    err instanceof SyntaxError ||
    err.message.includes("Malformed JSON in request body") ||
    err.message.includes("JSON")
  ) {
    return c.json(
      { success: false, error: "Malformed JSON in request body" },
      400
    );
  }

  // Bắt lỗi không tìm thấy tài nguyên từ repository
  if (err.message.toLowerCase().includes("not found")) {
    return c.json(
      { success: false, error: err.message },
      404
    );
  }

  const traceId = crypto.randomUUID();
  console.error(`[CRITICAL ERROR][${traceId}] ${c.req.method} ${c.req.url}:`, err);

  const isProduction =
    c.env?.NODE_ENV === "production" || c.env?.ENVIRONMENT === "production";

  return c.json(
    {
      success: false,
      error: isProduction
        ? "Lỗi máy chủ nội bộ (Internal Server Error)"
        : err.message || "Internal Server Error",
      traceId,
    },
    500
  );
};
