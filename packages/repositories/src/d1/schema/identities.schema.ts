import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import type { IdentityType } from "@khangviet/types";

/**
 * Bảng identities: Quản lý thực thể con người / pháp nhân (Party Model).
 * Tách biệt hoàn toàn thông tin định danh khỏi tài khoản xác thực đăng nhập.
 * Hỗ trợ cá nhân (INDIVIDUAL) và tổ chức doanh nghiệp (ORGANIZATION) với tax_code.
 */
export const identitiesTable = sqliteTable(
  "identities",
  {
    id: text("id").primaryKey(),
    fullName: text("full_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    taxCode: text("tax_code"),
    identityType: text("identity_type")
      .$type<IdentityType>()
      .notNull()
      .default("INDIVIDUAL"),
    address: text("address"),
    notes: text("notes"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_identities_phone").on(table.phone),
  ]
);

export type IdentityRecord = typeof identitiesTable.$inferSelect;
export type InsertIdentityRecord = typeof identitiesTable.$inferInsert;
