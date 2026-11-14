import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { organizationsTable } from "./organizations.schema";

/**
 * Bảng key_accounts: Mở rộng 1-0..1 cho đối tác chiến lược hiển thị trên Gallery.
 * Không lưu snapshot tên/logo công ty mà JOIN qua organizations -> identities.
 */
export const keyAccountsTable = sqliteTable(
  "key_accounts",
  {
    organizationId: text("organization_id")
      .primaryKey()
      .references(() => organizationsTable.identityId, { onDelete: "cascade" }),
    slug: text("slug").notNull().unique(),
    tag: text("tag").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    index("idx_key_accounts_sort").on(table.sortOrder),
  ]
);

export type KeyAccountRecord = typeof keyAccountsTable.$inferSelect;
export type InsertKeyAccountRecord = typeof keyAccountsTable.$inferInsert;
