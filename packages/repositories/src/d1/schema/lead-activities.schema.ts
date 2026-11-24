import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import type { LeadActivityAction } from "@khangviet/types";
import { leadsTable } from "./leads.schema";
import { usersTable } from "./users.schema";

export const leadActivitiesTable = sqliteTable(
  "lead_activities",
  {
    id: text("id").primaryKey(),
    leadId: text("lead_id")
      .notNull()
      .references(() => leadsTable.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    action: text("action").$type<LeadActivityAction>().notNull(),
    note: text("note").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    index("idx_lead_activities_lead_created").on(table.leadId, table.createdAt),
  ]
);

export type LeadActivityRecord = typeof leadActivitiesTable.$inferSelect;
export type InsertLeadActivityRecord = typeof leadActivitiesTable.$inferInsert;
