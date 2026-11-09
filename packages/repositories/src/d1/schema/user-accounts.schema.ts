import { sqliteTable, text, integer, check } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import type { UserRole } from "@khangviet/types";
import { identitiesTable } from "./identities.schema";

/**
 * Bảng user_accounts: Lưu thông tin tài khoản đăng nhập (Auth Layer).
 * Khóa ngoại identity_id liên kết với bảng identities với RESTRICT để bảo vệ dữ liệu.
 */
export const userAccountsTable = sqliteTable(
  "user_accounts",
  {
    id: text("id").primaryKey(),
    identityId: text("identity_id")
      .notNull()
      .references(() => identitiesTable.id, { onDelete: "restrict" }),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").$type<UserRole>().notNull().default("CUSTOMER"),
    isActive: integer("is_active").notNull().default(1),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    check("check_user_accounts_role", sql`${table.role} IN ('ADMIN', 'STAFF', 'CUSTOMER')`),
  ]
);

export type UserAccountRecord = typeof userAccountsTable.$inferSelect;
export type InsertUserAccountRecord = typeof userAccountsTable.$inferInsert;
