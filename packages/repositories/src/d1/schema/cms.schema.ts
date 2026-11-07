import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import type { ChangeActionType, PendingChangeStatus } from "@khangviet/types";

/**
 * Bảng CMS Metadata lưu trữ các khối nội dung dạng Document (Hero, Legal, Stats).
 * Ràng buộc: key là duy nhất, value_json lưu đối tượng nội dung tương ứng.
 */
export const cmsMetadataTable = sqliteTable("cms_metadata", {
  key: text("key").primaryKey(),
  valueJson: text("value_json").notNull(),
  updatedAt: text("updated_at").notNull(),
});

/**
 * Bảng Pending Changes lưu các thay đổi CMS đang ở trạng thái Staging/Duyệt.
 * Hỗ trợ cơ chế Midnight Sync hoặc xuất bản thủ công (Apply Changes).
 */
export const pendingChangesTable = sqliteTable(
  "pending_changes",
  {
    id: text("id").primaryKey(),
    action: text("action").$type<ChangeActionType>().notNull(),
    targetId: text("target_id"),
    payload: text("payload", { mode: "json" }).notNull(),
    status: text("status").$type<PendingChangeStatus>().notNull().default("PENDING"),
    createdAt: text("created_at").notNull(),
    appliedAt: text("applied_at"),
  },
  (table) => [
    index("idx_pending_changes_status").on(table.status),
    index("idx_pending_changes_created").on(table.createdAt),
  ]
);

export type CmsMetadataRecord = typeof cmsMetadataTable.$inferSelect;
export type PendingChangeRecord = typeof pendingChangesTable.$inferSelect;
