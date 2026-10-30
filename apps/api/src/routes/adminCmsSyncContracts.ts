import { createRoute, z } from "@hono/zod-openapi";
import { SyncStatusSchema, PendingChangeSchema } from "@khangviet/types";

export const getSyncStatusRoute = createRoute({
  method: "get",
  path: "/sync-status",
  summary: "Kiểm tra trạng thái đồng bộ CMS",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: SyncStatusSchema,
          }),
        },
      },
      description: "Trạng thái đồng bộ",
    },
  },
});

export const getPendingChangesRoute = createRoute({
  method: "get",
  path: "/pending",
  summary: "Danh sách các thay đổi đang chờ duyệt",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: z.array(PendingChangeSchema),
          }),
        },
      },
      description: "Danh sách thay đổi",
    },
  },
});

export const applyPendingChangesRoute = createRoute({
  method: "post",
  path: "/apply-pending",
  summary: "Áp dụng tất cả thay đổi đang chờ",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: z.object({
              appliedCount: z.number(),
              success: z.boolean(),
            }),
            message: z.string(),
          }),
        },
      },
      description: "Kết quả áp dụng thay đổi",
    },
  },
});

export const discardPendingChangeRoute = createRoute({
  method: "delete",
  path: "/pending/{id}",
  summary: "Hủy bỏ một thay đổi đang chờ",
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
      description: "Kết quả hủy thay đổi",
    },
  },
});

