import { createRoute, z } from "@hono/zod-openapi";
import { ContactLeadSchema, LeadStatusSchema } from "@khangviet/types";
import { ErrorResponseSchema } from "../schemas/apiResponse";

export const updateAdminLeadStatusRoute = createRoute({
  method: "patch",
  path: "/{id}/status",
  summary: "Cập nhật trạng thái lead",
  request: {
    params: z.object({ id: z.string().min(1) }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            status: LeadStatusSchema,
            notes: z.string().optional(),
          }),
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
            data: ContactLeadSchema,
          }),
        },
      },
      description: "Cập nhật thành công",
    },
    400: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Dữ liệu payload hoặc ID không hợp lệ",
    },
    404: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Lead không tồn tại",
    },
  },
});

export const deleteAdminLeadRoute = createRoute({
  method: "delete",
  path: "/{id}",
  summary: "Xóa lead",
  request: {
    params: z.object({ id: z.string().min(1) }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ success: z.boolean() }),
        },
      },
      description: "Kết quả xóa lead",
    },
    400: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "ID không hợp lệ",
    },
  },
});

