import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { identitiesTable } from "./identities.schema";
import { leadsTable } from "./leads.schema";

/**
 * Bảng lead_activities: Theo dõi nhật ký tương tác và tiến trình chăm sóc khách hàng.
 * Cascade delete theo lead_id, set null theo staff_identity_id.
 */
export const leadActivitiesTable = sqliteTable(
  "lead_activities",
  {
    id: text("id").primaryKey(),
    leadId: text("lead_id")
      .notNull()
      .references(() => leadsTable.id, { onDelete: "cascade" }),
    staffIdentityId: text("staff_identity_id")
      .references(() => identitiesTable.id, { onDelete: "set null" }),
    actionType: text("action_type").notNull(),
    content: text("content").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("idx_lead_activities_lead_id").on(table.leadId),
  ]
);

export type LeadActivityRecord = typeof leadActivitiesTable.$inferSelect;
export type InsertLeadActivityRecord = typeof leadActivitiesTable.$inferInsert;
