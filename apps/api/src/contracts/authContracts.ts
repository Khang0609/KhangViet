import { createRoute, z } from "@hono/zod-openapi";
import {
  LoginCredentialsSchema,
  LoginResponseDataSchema,
} from "@khangviet/types";
import { ErrorResponseSchema } from "../schemas/apiResponse";

/**
 * Route đăng nhập xác thực người dùng bằng email và mật khẩu.
 * Khi thành công, server trả về access token trong body và refresh token qua HttpOnly cookie.
 */
export const loginRoute = createRoute({
  method: "post",
  path: "/login",
  summary: "Đăng nhập hệ thống",
  request: {
    body: {
      content: {
        "application/json": {
          schema: LoginCredentialsSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: LoginResponseDataSchema,
          }),
        },
      },
      description: "Đăng nhập thành công",
    },
    400: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Dữ liệu đăng nhập không hợp lệ",
    },
    401: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Sai email hoặc mật khẩu",
    },
  },
});

/**
 * Route cấp phát lại accessToken mới khi token cũ hết hạn (Token Rotation).
 * Refresh token được trình duyệt tự động gửi kèm qua HttpOnly cookie.
 */
export const refreshRoute = createRoute({
  method: "post",
  path: "/refresh",
  summary: "Làm mới Access Token",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: z.object({
              accessToken: z.string(),
            }),
          }),
        },
      },
      description: "Cấp phát token mới thành công",
    },
    401: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Refresh token không hợp lệ hoặc đã hết hạn",
    },
  },
});
