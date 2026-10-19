import { Context, Next } from "hono";

export const adminAuthMiddleware = async (c: Context, next: Next) => {
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

