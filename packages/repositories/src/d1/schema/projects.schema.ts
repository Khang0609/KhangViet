import { sqliteTable, text, integer, index, check } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import type { ProjectStatus } from "@khangviet/types";
import { identitiesTable } from "./identities.schema";

/**
 * Bảng projects: Lưu trữ thông tin dự án/công trình kiến trúc tiêu biểu.
 * Chuẩn hóa 3NF: Loại bỏ gallery JSON, year chuyển sang integer có check constraint.
 */
export const projectsTable = sqliteTable(
  "projects",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull().unique(),
    title: text("title").notNull(),
    subtitle: text("subtitle").notNull(),
    client: text("client").notNull(),
    clientIdentityId: text("client_identity_id")
      .references(() => identitiesTable.id, { onDelete: "set null" }),
    locations: text("locations", { mode: "json" }).$type<string[]>().notNull(),
    year: integer("year").notNull(),
    categoryTag: text("category_tag").notNull(),
    scaleMetric: text("scale_metric").notNull(),
    materials: text("materials", { mode: "json" }).$type<string[]>().notNull(),
    engineeringNotes: text("engineering_notes", { mode: "json" })
      .$type<string[]>()
      .notNull(),
    summary: text("summary").notNull(),
    coverImage: text("cover_image").notNull(),
    status: text("status").$type<ProjectStatus>().notNull().default("PUBLISHED"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_projects_category").on(table.categoryTag),
    index("idx_projects_status").on(table.status),
    check("projects_year_range", sql`${table.year} >= 1990 AND ${table.year} <= 2100`),
    check("check_projects_status", sql`${table.status} IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')`),
  ]
);

export type ProjectRecord = typeof projectsTable.$inferSelect;
export type InsertProjectRecord = typeof projectsTable.$inferInsert;
