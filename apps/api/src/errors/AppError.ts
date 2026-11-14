import type { ContentfulStatusCode } from "hono/utils/http-status";

export type AppErrorStatusCode = Extract<
  ContentfulStatusCode,
  400 | 401 | 403 | 404 | 409 | 422
>;

/**
 * Lỗi nghiệp vụ/validation có HTTP Status Code rõ ràng,
 * giúp errorHandler phân tách minh bạch khỏi lỗi 500 Internal Server Error.
 */
export class AppError extends Error {
  public readonly statusCode: AppErrorStatusCode;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    statusCode: AppErrorStatusCode,
    message: string,
    code: string = "APP_ERROR",
    details?: unknown
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(400, message, "BAD_REQUEST", details);
  }

  static notFound(message: string) {
    return new AppError(404, message, "NOT_FOUND");
  }

  static conflict(message: string, details?: unknown) {
    return new AppError(409, message, "CONFLICT", details);
  }
}
