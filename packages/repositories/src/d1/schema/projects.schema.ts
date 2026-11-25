import { sqliteTable, text, integer, index, check } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import type { PublishStatus } from "@khangviet/types";
import { organizationsTable } from "./organizations.schema";

export const projectsTable = sqliteTable(
  "projects",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    summary: text("summary"),
    organizationId: text("organization_id").references(
      () => organizationsTable.id,
      { onDelete: "set null" }
    ),
    year: integer("year"),
    publishStatus: text("publish_status")
      .$type<PublishStatus>()
      .notNull()
      .default("DRAFT"),
    isFeatured: integer("is_featured").notNull().default(0),
    featuredOrder: integer("featured_order").notNull().default(0),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    index("idx_projects_publish_featured").on(
      table.publishStatus,
      table.isFeatured,
      table.featuredOrder
    ),
    index("idx_projects_org").on(table.organizationId),
    check(
      "check_projects_publish_status",
      sql`${table.publishStatus} IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')`
    ),
  ]
);

export type ProjectRecord = typeof projectsTable.$inferSelect;
export type InsertProjectRecord = typeof projectsTable.$inferInsert;
