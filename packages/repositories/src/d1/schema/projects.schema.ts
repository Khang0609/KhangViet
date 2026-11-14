import { sqliteTable, text, integer, index, check } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import type { ProjectSegment, ProjectStage } from "@khangviet/types";
import { identitiesTable } from "./identities.schema";
import { keyAccountsTable } from "./key-accounts.schema";

/**
 * Bảng projects: Lưu trữ thông tin dự án/công trình kiến trúc dùng chung cho Gallery & Landing.
 * Loại bỏ status Draft/Published và sortOrder của Landing (đã tách sang landing_placements).
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
    keyAccountId: text("key_account_id")
      .references(() => keyAccountsTable.organizationId, { onDelete: "set null" }),
    segment: text("segment").$type<ProjectSegment>().notNull().default("B2B"),
    stage: text("stage").$type<ProjectStage>().notNull().default("COMPLETED"),
    locations: text("locations", { mode: "json" }).$type<string[]>().notNull(),
    year: integer("year").notNull(),
    categoryTag: text("category_tag").notNull(),
    scaleMetric: text("scale_metric").notNull(),
    teamAndTimeline: text("team_and_timeline"),
    materials: text("materials", { mode: "json" }).$type<string[]>().notNull(),
    engineeringNotes: text("engineering_notes", { mode: "json" })
      .$type<string[]>()
      .notNull(),
    summary: text("summary").notNull(),
    coverImage: text("cover_image").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_projects_gallery_filter").on(table.segment, table.stage, table.categoryTag),
    index("idx_projects_key_account").on(table.keyAccountId),
    check("projects_year_range", sql`${table.year} >= 1990 AND ${table.year} <= 2100`),
    check("check_projects_segment", sql`${table.segment} IN ('B2B', 'C2B')`),
    check("check_projects_stage", sql`${table.stage} IN ('COMPLETED', 'TENDER_3D')`),
  ]
);

export type ProjectRecord = typeof projectsTable.$inferSelect;
export type InsertProjectRecord = typeof projectsTable.$inferInsert;
