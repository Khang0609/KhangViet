import { sqliteTable, text, integer, check } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import type { UserRole } from "@khangviet/types";

export const usersTable = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    role: text("role").$type<UserRole>().notNull().default("STAFF"),
    isActive: integer("is_active").notNull().default(1),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    check("check_users_role", sql`${table.role} IN ('ADMIN', 'STAFF')`),
  ]
);

export type UserRecord = typeof usersTable.$inferSelect;
export type InsertUserRecord = typeof usersTable.$inferInsert;
