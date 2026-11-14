import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { identitiesTable } from "./identities.schema";

/**
 * Bảng organizations: Mở rộng 1-1 cho thực thể tổ chức (ORGANIZATION) từ identities.
 * Lưu thông tin hồ sơ doanh nghiệp dùng chung cho CRM và Gallery.
 */
export const organizationsTable = sqliteTable("organizations", {
  identityId: text("identity_id")
    .primaryKey()
    .references(() => identitiesTable.id, { onDelete: "restrict" }),
  scale: text("scale"),
  description: text("description"),
  logoUrl: text("logo_url"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export type OrganizationRecord = typeof organizationsTable.$inferSelect;
export type InsertOrganizationRecord = typeof organizationsTable.$inferInsert;
