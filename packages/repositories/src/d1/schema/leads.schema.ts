import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import type { LeadStatus } from "@khangviet/types";

/**
 * Bảng Leads lưu trữ thông tin khách hàng tiềm năng gửi form liên hệ.
 * Tối ưu hóa: Đánh index cho status để lọc CRM, created_at để sắp xếp,
 * và phone để tra cứu chống spam hoặc trùng lặp liên hệ.
 */
export const leadsTable = sqliteTable(
  "leads",
  {
    id: text("id").primaryKey(),
    fullName: text("full_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    serviceCategory: text("service_category"),
    projectScale: text("project_scale"),
    message: text("message"),
    status: text("status").$type<LeadStatus>().notNull().default("NEW"),
    notes: text("notes"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_leads_status").on(table.status),
    index("idx_leads_created_at").on(table.createdAt),
    index("idx_leads_phone").on(table.phone),
  ]
);

export type LeadRecord = typeof leadsTable.$inferSelect;
export type InsertLeadRecord = typeof leadsTable.$inferInsert;
