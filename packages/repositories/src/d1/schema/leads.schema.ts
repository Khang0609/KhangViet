import { sqliteTable, text, integer, index, check } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import type { LeadStatus } from "@khangviet/types";
import { servicesTable } from "./services.schema";

export const leadsTable = sqliteTable(
  "leads",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone").notNull(),
    companyName: text("company_name"),
    serviceId: text("service_id").references(() => servicesTable.id, {
      onDelete: "set null",
    }),
    message: text("message"),
    budgetRange: text("budget_range"),
    source: text("source"),
    status: text("status").$type<LeadStatus>().notNull().default("NEW"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    index("idx_leads_status_created").on(table.status, table.createdAt),
    check(
      "check_leads_status",
      sql`${table.status} IN ('NEW', 'CONTACTED', 'QUOTED', 'WON', 'LOST')`
    ),
  ]
);

export type LeadRecord = typeof leadsTable.$inferSelect;
export type InsertLeadRecord = typeof leadsTable.$inferInsert;
