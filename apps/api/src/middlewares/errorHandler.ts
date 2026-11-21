import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { AppError } from "../errors/AppError";

interface StatusCodedError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Global Error Handler với Tracing Context và che giấu stack trace (SEC-06).
 * Phân tách rõ lỗi nghiệp vụ/validation (400, 404, 409, 415) khỏi lỗi 500.
 */
export const errorHandler = async (err: Error, c: Context) => {
  if (err instanceof AppError) {
    return c.json(
      { success: false as const, error: err.message, code: err.code },
      err.statusCode
    );
  }

  if (err instanceof HTTPException) {
    const status = (err.status >= 400 && err.status < 600 ? err.status : 400) as ContentfulStatusCode;
    return c.json(
      { success: false as const, error: err.message || "Request Error" },
      status
    );
  }

  const coded = err as StatusCodedError;
  if (
    typeof coded.statusCode === "number" &&
    coded.statusCode >= 400 &&
    coded.statusCode < 500
  ) {
    return c.json(
      { success: false as const, error: err.message },
      coded.statusCode as ContentfulStatusCode
    );
  }

  // Bắt lỗi Content-Type không được hỗ trợ
  if (
    err.message.includes("Unsupported Media Type") ||
    err.message.includes("Content-Type")
  ) {
    return c.json(
      { success: false as const, error: "Unsupported Media Type" },
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
      { success: false as const, error: "Malformed JSON in request body" },
      400
    );
  }

  const isProduction =
    c.env?.NODE_ENV === "production" || c.env?.ENVIRONMENT === "production";

  // Bắt lỗi không tìm thấy tài nguyên từ repository
  if (err.message.toLowerCase().includes("not found")) {
    return c.json(
      {
        success: false as const,
        error: isProduction ? "Không tìm thấy tài nguyên yêu cầu" : err.message,
      },
      404
    );
  }

  const traceId = crypto.randomUUID();
  console.error(`[CRITICAL ERROR][${traceId}] ${c.req.method} ${c.req.url}:`, err);

  return c.json(
    {
      success: false as const,
      error: isProduction
        ? "Lỗi máy chủ nội bộ (Internal Server Error)"
        : err.message || "Internal Server Error",
      traceId,
    },
    500
  );
};
