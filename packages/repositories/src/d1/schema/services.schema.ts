import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const servicesTable = sqliteTable("services", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export type ServiceRecord = typeof servicesTable.$inferSelect;
export type InsertServiceRecord = typeof servicesTable.$inferInsert;
