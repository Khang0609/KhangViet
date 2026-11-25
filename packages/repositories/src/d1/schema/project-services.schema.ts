import { sqliteTable, text, primaryKey, index } from "drizzle-orm/sqlite-core";
import { projectsTable } from "./projects.schema";
import { servicesTable } from "./services.schema";

export const projectServicesTable = sqliteTable(
  "project_services",
  {
    projectId: text("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
    serviceId: text("service_id")
      .notNull()
      .references(() => servicesTable.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.serviceId] }),
    index("idx_project_services_service").on(table.serviceId),
  ]
);

export type ProjectServiceRecord = typeof projectServicesTable.$inferSelect;
export type InsertProjectServiceRecord = typeof projectServicesTable.$inferInsert;
