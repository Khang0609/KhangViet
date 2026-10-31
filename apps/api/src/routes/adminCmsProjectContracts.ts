import { createRoute, z } from "@hono/zod-openapi";
import { FeaturedProjectSchema } from "@khangviet/types";
import { ErrorResponseSchema } from "../schemas/apiResponse";

const ProjectMutationResponse = z.object({
  success: z.literal(true),
  pending: z.boolean(),
  data: z.unknown(),
});

export const createProjectRoute = createRoute({
  method: "post",
  path: "/projects",
  summary: "Tạo mới dự án",
  request: {
    body: {
      content: { "application/json": { schema: FeaturedProjectSchema } },
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: ProjectMutationResponse } },
      description: "Tạo dự án thành công",
    },
    400: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Dữ liệu payload không hợp lệ",
    },
  },
});

export const updateProjectRoute = createRoute({
  method: "put",
  path: "/projects/{id}",
  summary: "Cập nhật dự án theo ID",
  request: {
    params: z.object({ id: z.string().min(1) }),
    body: {
      content: { "application/json": { schema: FeaturedProjectSchema } },
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: ProjectMutationResponse } },
      description: "Cập nhật dự án thành công",
    },
    400: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Dữ liệu payload không hợp lệ",
    },
    404: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Không tìm thấy dự án",
    },
  },
});

export const deleteProjectRoute = createRoute({
  method: "delete",
  path: "/projects/{id}",
  summary: "Xóa dự án theo ID",
  request: {
    params: z.object({ id: z.string().min(1) }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: ProjectMutationResponse } },
      description: "Xóa dự án thành công",
    },
    400: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "ID không hợp lệ",
    },
  },
});
