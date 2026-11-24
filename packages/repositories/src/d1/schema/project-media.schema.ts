import { sqliteTable, text, integer, index, check } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import type { ProjectMediaKind } from "@khangviet/types";
import { projectsTable } from "./projects.schema";

export const projectMediaTable = sqliteTable(
  "project_media",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
    kind: text("kind").$type<ProjectMediaKind>().notNull().default("GALLERY"),
    storageKey: text("storage_key").notNull(),
    altText: text("alt_text"),
    caption: text("caption"),
    sortOrder: integer("sort_order").notNull().default(0),
    isCover: integer("is_cover").notNull().default(0),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    index("idx_project_media_project_sort").on(table.projectId, table.sortOrder),
    check(
      "check_project_media_kind",
      sql`${table.kind} IN ('RENDER', 'ACTUAL', 'HERO', 'GALLERY')`
    ),
  ]
);

export type ProjectMediaRecord = typeof projectMediaTable.$inferSelect;
export type InsertProjectMediaRecord = typeof projectMediaTable.$inferInsert;
