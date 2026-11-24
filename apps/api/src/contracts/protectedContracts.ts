import { createRoute, z } from "@hono/zod-openapi";
import { UserSchema } from "@khangviet/types";
import { ErrorResponseSchema } from "../schemas/apiResponse";

/**
 * Route kiểm tra danh tính nhân sự qua Cloudflare Access Zero Trust.
 */
export const protectedRoute = createRoute({
  method: "get",
  path: "/protected",
  summary: "Truy vấn thông tin nhân sự đã xác thực qua Cloudflare Access",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: z.object({
              message: z.string(),
              user: UserSchema,
            }),
          }),
        },
      },
      description: "Truy cập tài nguyên thành công",
    },
    401: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Chưa xác thực Cloudflare Access",
    },
  },
});
