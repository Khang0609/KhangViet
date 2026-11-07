import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import type { ProjectGalleryItem } from "@khangviet/types";

/**
 * Bảng Projects lưu trữ các công trình kiến trúc / dự án tiêu biểu.
 * Cột mảng phức tạp (materials, engineeringNotes, gallery) được lưu dạng JSON text
 * với chế độ mode: 'json' để Drizzle tự động parse/stringify an toàn.
 */
export const projectsTable = sqliteTable(
  "projects",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull().unique(),
    title: text("title").notNull(),
    subtitle: text("subtitle").notNull(),
    client: text("client").notNull(),
    locations: text("locations", { mode: "json" }).$type<string[]>().notNull(),
    year: text("year").notNull(),
    categoryTag: text("category_tag").notNull(),
    scaleMetric: text("scale_metric").notNull(),
    materials: text("materials", { mode: "json" }).$type<string[]>().notNull(),
    engineeringNotes: text("engineering_notes", { mode: "json" })
      .$type<string[]>()
      .notNull(),
    summary: text("summary").notNull(),
    coverImage: text("cover_image").notNull(),
    gallery: text("gallery", { mode: "json" })
      .$type<ProjectGalleryItem[]>()
      .notNull(),
  },
  (table) => [
    index("idx_projects_code").on(table.code),
    index("idx_projects_category").on(table.categoryTag),
  ]
);

export type ProjectRecord = typeof projectsTable.$inferSelect;
export type InsertProjectRecord = typeof projectsTable.$inferInsert;
