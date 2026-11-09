import { sqliteTable, text, index, check } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import type { LeadStatus } from "@khangviet/types";
import { identitiesTable } from "./identities.schema";

/**
 * Bảng leads: Lưu thông tin yêu cầu tư vấn của khách hàng tiềm năng.
 * Tách biệt thông tin định danh bằng khóa ngoại identity_id (RESTRICT).
 */
export const leadsTable = sqliteTable(
  "leads",
  {
    id: text("id").primaryKey(),
    identityId: text("identity_id")
      .notNull()
      .references(() => identitiesTable.id, { onDelete: "restrict" }),
    serviceCategory: text("service_category"),
    projectScale: text("project_scale"),
    initialMessage: text("initial_message"),
    status: text("status").$type<LeadStatus>().notNull().default("NEW"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_leads_identity_id").on(table.identityId),
    index("idx_leads_status").on(table.status),
    index("idx_leads_created_at").on(table.createdAt),
    check("check_leads_status", sql`${table.status} IN ('NEW', 'CONTACTED', 'SURVEY_SCHEDULED', 'QUOTED', 'WON', 'LOST')`),
  ]
);

export type LeadRecord = typeof leadsTable.$inferSelect;
export type InsertLeadRecord = typeof leadsTable.$inferInsert;
