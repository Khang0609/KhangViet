import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import type { UserRole } from "@khangviet/types";

/**
 * Bảng Users lưu trữ thông tin xác thực quản trị và khách hàng.
 * Ràng buộc: Email là duy nhất, role tuân theo UserRole enum.
 * UUIDv7 được dùng làm primary key để tối ưu tra cứu B-Tree.
 */
export const usersTable = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    role: text("role").$type<UserRole>().notNull(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_users_email").on(table.email),
  ]
);

export type UserRecord = typeof usersTable.$inferSelect;
export type InsertUserRecord = typeof usersTable.$inferInsert;
