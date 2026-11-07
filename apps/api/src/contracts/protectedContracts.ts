import { createRoute, z } from "@hono/zod-openapi";
import { SafeUserSchema } from "@khangviet/types";
import { ErrorResponseSchema } from "../schemas/apiResponse";

/**
 * Route kiểm tra chứng thực với Bearer AccessToken.
 * Trả về thông tin người dùng được định danh từ JWT payload.
 */
export const protectedRoute = createRoute({
  method: "get",
  path: "/protected",
  summary: "Truy vấn tài nguyên yêu cầu xác thực Bearer Token",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: z.object({
              message: z.string(),
              user: SafeUserSchema,
            }),
          }),
        },
      },
      description: "Truy cập tài nguyên thành công",
    },
    401: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Chưa đăng nhập hoặc token không hợp lệ / hết hạn",
    },
  },
});

