import { sqliteTable, text, integer, index, uniqueIndex, check } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import type { LandingSlotType, LandingPlacementMeta } from "@khangviet/types";
import { projectsTable } from "./projects.schema";

/**
 * Bảng landing_placements: Quản lý các vị trí hiển thị chọn lọc trên Landing Page
 * (HERO_SLIDE và FEATURED_SHOWCASE), tách biệt khỏi bảng projects.
 */
export const landingPlacementsTable = sqliteTable(
  "landing_placements",
  {
    id: text("id").primaryKey(),
    slotType: text("slot_type").$type<LandingSlotType>().notNull(),
    projectId: text("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
    customMeta: text("custom_meta", { mode: "json" }).$type<LandingPlacementMeta>(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("uq_landing_placements_slot_project").on(table.slotType, table.projectId),
    index("idx_landing_placements_slot").on(table.slotType, table.sortOrder),
    check("check_landing_slot_type", sql`${table.slotType} IN ('HERO_SLIDE', 'FEATURED_SHOWCASE')`),
  ]
);

export type LandingPlacementRecord = typeof landingPlacementsTable.$inferSelect;
export type InsertLandingPlacementRecord = typeof landingPlacementsTable.$inferInsert;
