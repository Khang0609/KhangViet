import { Context, Next } from "hono";

/**
 * Tạm thời bypass kiểm tra authentication để tiện test và phát triển UI.
 * Khi cần kích hoạt lại xác thực (ví dụ dùng Axios/JWT), bật lại đoạn kiểm tra bên dưới.
 */
export const adminAuthMiddleware = async (c: Context, next: Next) => {
  // BYPASS_AUTH = true: Cho phép gọi thẳng vào Admin API mà không cần token
  const BYPASS_AUTH = true;

  if (BYPASS_AUTH) {
    return await next();
  }

  const authHeader = c.req.header("Authorization");
  const expectedKey = c.env?.ADMIN_API_KEY || "khangviet-admin-secret-2026";

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      {
        success: false,
        error: "Unauthorized: Missing Bearer token in Authorization header",
      },
      401
    );
  }

  const token = authHeader.substring(7).trim();
  if (token !== expectedKey) {
    return c.json(
      {
        success: false,
        error: "Forbidden: Invalid authorization token",
      },
      403
    );
  }

  await next();
};
