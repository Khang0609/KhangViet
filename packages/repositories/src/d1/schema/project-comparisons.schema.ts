import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { projectsTable } from "./projects.schema";
import { projectMediaTable } from "./project-media.schema";

/**
 * Bảng project_comparisons: Lưu các cặp ảnh đối chiếu 3D vs Thực tế cùng góc máy.
 * Tham chiếu trực tiếp 2 khóa ngoại tới project_media (Zero Data Duplication).
 */
export const projectComparisonsTable = sqliteTable(
  "project_comparisons",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    renderMediaId: text("render_media_id")
      .notNull()
      .references(() => projectMediaTable.id, { onDelete: "cascade" }),
    actualMediaId: text("actual_media_id")
      .notNull()
      .references(() => projectMediaTable.id, { onDelete: "cascade" }),
    aspectRatio: text("aspect_ratio").notNull().default("16/10"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    index("idx_project_comparisons_project").on(table.projectId, table.sortOrder),
  ]
);

export type ProjectComparisonRecord = typeof projectComparisonsTable.$inferSelect;
export type InsertProjectComparisonRecord = typeof projectComparisonsTable.$inferInsert;
