import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { projectsTable } from "./projects.schema";
import { projectMediaTable } from "./project-media.schema";

export const projectComparisonsTable = sqliteTable(
  "project_comparisons",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
    renderMediaId: text("render_media_id")
      .notNull()
      .references(() => projectMediaTable.id, { onDelete: "cascade" }),
    actualMediaId: text("actual_media_id")
      .notNull()
      .references(() => projectMediaTable.id, { onDelete: "cascade" }),
  },
  (table) => [index("idx_project_comparisons_project").on(table.projectId)]
);

export type ProjectComparisonRecord = typeof projectComparisonsTable.$inferSelect;
export type InsertProjectComparisonRecord = typeof projectComparisonsTable.$inferInsert;
