import { createRoute, z } from "@hono/zod-openapi";
import {
  CreateProjectDtoSchema,
  ProjectSchema,
  UpdateProjectDtoSchema,
} from "@khangviet/types";
import { ErrorResponseSchema } from "../schemas/apiResponse";

const ProjectMutationResponse = z.object({
  success: z.literal(true),
  data: ProjectSchema,
});

export const createProjectRoute = createRoute({
  method: "post",
  path: "/projects",
  summary: "Tạo mới dự án",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateProjectDtoSchema,
        },
      },
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
    409: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Đường dẫn (slug) dự án đã tồn tại",
    },
  },
});

export const updateProjectRoute = createRoute({
  method: "put",
  path: "/projects/{id}",
  summary: "Cập nhật dự án theo ID",
  request: {
    params: z.object({ id: z.string().trim().min(1) }),
    body: {
      content: { "application/json": { schema: UpdateProjectDtoSchema } },
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
    409: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Đường dẫn (slug) dự án bị trùng",
    },
  },
});

export const deleteProjectRoute = createRoute({
  method: "delete",
  path: "/projects/{id}",
  summary: "Xóa dự án theo ID",
  request: {
    params: z.object({ id: z.string().trim().min(1) }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: z.object({ deleted: z.literal(true), id: z.string() }),
          }),
        },
      },
      description: "Xóa dự án thành công",
    },
    400: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "ID không hợp lệ",
    },
    404: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Không tìm thấy dự án để xóa",
    },
  },
});
