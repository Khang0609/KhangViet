import { Context, Next } from "hono";
import { authMiddleware, requireAdmin, AppEnv } from "./authMiddleware";

/**
 * Middleware bảo vệ các tài nguyên Admin API.
 * Yêu cầu Bearer AccessToken hợp lệ VÀ Role tài khoản phải là ADMIN.
 */
export const adminAuthMiddleware = async (c: Context<AppEnv>, next: Next) => {
  return await authMiddleware(c, async () => {
    return await requireAdmin(c, next);
  });
};
