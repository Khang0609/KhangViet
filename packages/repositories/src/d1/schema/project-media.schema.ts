import { sqliteTable, text, integer, index, check } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import type { ProjectMediaType } from "@khangviet/types";
import { projectsTable } from "./projects.schema";

/**
 * Bảng project_media: Quản lý danh mục hình ảnh, bản vẽ kiến trúc trên Cloudflare R2.
 * Hỗ trợ cascade delete khi xóa dự án cha và composite index theo tab media_type.
 */
export const projectMediaTable = sqliteTable(
  "project_media",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
    mediaType: text("media_type")
      .$type<ProjectMediaType>()
      .notNull()
      .default("ACTUAL"),
    r2Key: text("r2_key"),
    publicUrl: text("public_url").notNull(),
    caption: text("caption"),
    location: text("location"),
    spec: text("spec"),
    aspectRatio: text("aspect_ratio"),
    widthPx: integer("width_px"),
    heightPx: integer("height_px"),
    fileSizeBytes: integer("file_size_bytes"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("idx_project_media_lookup").on(table.projectId, table.mediaType, table.sortOrder),
    check(
      "check_project_media_type",
      sql`${table.mediaType} IN ('ACTUAL', 'RENDER_3D', 'CONSTRUCTION', 'FLOOR_PLAN', 'COVER', 'GALLERY_IMAGE', 'VIDEO')`
    ),
  ]
);

export type ProjectMediaRecord = typeof projectMediaTable.$inferSelect;
export type InsertProjectMediaRecord = typeof projectMediaTable.$inferInsert;
