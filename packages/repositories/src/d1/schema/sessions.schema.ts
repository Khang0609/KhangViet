import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { userAccountsTable } from "./user-accounts.schema";

/**
 * Bảng sessions: Lưu phiên làm việc của người dùng trên Cloudflare D1.
 * Cơ chế Session Cookie (Stateful) thay thế hoàn toàn stateless JWT,
 * giúp kiểm soát thu hồi phiên tức thì và bảo mật tuyệt đối trước XSS/Credential Leak.
 */
export const sessionsTable = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => userAccountsTable.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    index("idx_sessions_user_id").on(table.userId),
    index("idx_sessions_expires_at").on(table.expiresAt),
  ],
);

export type SessionRecord = typeof sessionsTable.$inferSelect;
export type InsertSessionRecord = typeof sessionsTable.$inferInsert;
