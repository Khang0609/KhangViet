import { createRoute, z } from "@hono/zod-openapi";
import { ContactLeadSchema, LeadStatusSchema } from "@khangviet/types";
import { ErrorResponseSchema } from "../schemas/apiResponse";

export const getAdminLeadsRoute = createRoute({
  method: "get",
  path: "/",
  summary: "Lấy danh sách CRM leads",
  request: {
    query: z.object({
      status: LeadStatusSchema.optional(),
      search: z.string().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: z.array(ContactLeadSchema),
          }),
        },
      },
      description: "Danh sách leads",
    },
    400: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Tham số truy vấn không hợp lệ",
    },
  },
});

export const getAdminLeadByIdRoute = createRoute({
  method: "get",
  path: "/{id}",
  summary: "Lấy chi tiết CRM lead",
  request: {
    params: z.object({ id: z.string().min(1) }),
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
      description: "Chi tiết lead",
    },
    400: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "ID không hợp lệ",
    },
    404: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Không tìm thấy lead",
    },
  },
});
