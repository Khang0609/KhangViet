import { createRoute, z } from "@hono/zod-openapi";
import {
  CreateOrganizationDtoSchema,
  OrganizationSchema,
  UpdateOrganizationDtoSchema,
} from "@khangviet/types";
import { ErrorResponseSchema } from "../schemas/apiResponse";

export const getAdminOrganizationsRoute = createRoute({
  method: "get",
  path: "/",
  summary: "Lấy danh sách đối tác / thương hiệu",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: z.array(OrganizationSchema),
          }),
        },
      },
      description: "Danh sách đối tác",
    },
  },
});

export const getAdminOrganizationByIdRoute = createRoute({
  method: "get",
  path: "/{id}",
  summary: "Lấy chi tiết đối tác theo ID",
  request: {
    params: z.object({ id: z.string().trim().min(1) }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: OrganizationSchema,
          }),
        },
      },
      description: "Chi tiết đối tác",
    },
    404: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Không tìm thấy đối tác",
    },
  },
});

export const createAdminOrganizationRoute = createRoute({
  method: "post",
  path: "/",
  summary: "Tạo mới đối tác / thương hiệu",
  request: {
    body: {
      content: {
        "application/json": { schema: CreateOrganizationDtoSchema },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: OrganizationSchema,
          }),
        },
      },
      description: "Tạo đối tác thành công",
    },
    400: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Dữ liệu không hợp lệ",
    },
    409: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Slug đối tác đã tồn tại",
    },
  },
});

export const updateAdminOrganizationRoute = createRoute({
  method: "put",
  path: "/{id}",
  summary: "Cập nhật đối tác theo ID",
  request: {
    params: z.object({ id: z.string().trim().min(1) }),
    body: {
      content: {
        "application/json": { schema: UpdateOrganizationDtoSchema },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: OrganizationSchema,
          }),
        },
      },
      description: "Cập nhật đối tác thành công",
    },
    400: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Dữ liệu không hợp lệ",
    },
    404: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Không tìm thấy đối tác",
    },
    409: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Slug đối tác bị trùng",
    },
  },
});

export const deleteAdminOrganizationRoute = createRoute({
  method: "delete",
  path: "/{id}",
  summary: "Xóa đối tác theo ID",
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
      description: "Xóa đối tác thành công",
    },
    404: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Không tìm thấy đối tác",
    },
  },
});
