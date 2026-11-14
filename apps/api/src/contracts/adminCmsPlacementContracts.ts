import { createRoute, z } from "@hono/zod-openapi";
import {
  LandingPlacementSchema,
  LandingPlacementSlotSchema,
  UpsertLandingPlacementSchema,
} from "@khangviet/types";
import { ErrorResponseSchema } from "../schemas/apiResponse";

export const getPlacementsRoute = createRoute({
  method: "get",
  path: "/placements",
  summary: "Lấy danh sách Curated Placements trên Landing Page",
  request: {
    query: z.object({
      slotType: LandingPlacementSlotSchema.optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: z.array(LandingPlacementSchema),
          }),
        },
      },
      description: "Danh sách placements",
    },
    400: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "slotType không hợp lệ",
    },
  },
});

export const upsertPlacementRoute = createRoute({
  method: "put",
  path: "/placements",
  summary: "Tạo mới hoặc cập nhật vị trí hiển thị trên Landing Page",
  request: {
    body: {
      content: { "application/json": { schema: UpsertLandingPlacementSchema } },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: LandingPlacementSchema,
          }),
        },
      },
      description: "Lưu placement thành công",
    },
    400: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Dữ liệu không hợp lệ hoặc projectId không tồn tại",
    },
  },
});

export const deletePlacementRoute = createRoute({
  method: "delete",
  path: "/placements/{id}",
  summary: "Xóa một vị trí hiển thị khỏi Landing Page",
  request: {
    params: z.object({
      id: z.string().trim().min(1, "ID placement không được để trống"),
    }),
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
      description: "Xóa placement thành công",
    },
    400: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "ID không hợp lệ",
    },
    404: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Không tìm thấy placement",
    },
  },
});
