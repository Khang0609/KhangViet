import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const organizationsTable = sqliteTable(
  "organizations",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    logoKey: text("logo_key"),
    isFeatured: integer("is_featured").notNull().default(0),
    featuredOrder: integer("featured_order").notNull().default(0),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    index("idx_organizations_featured").on(table.isFeatured, table.featuredOrder),
  ]
);

export type OrganizationRecord = typeof organizationsTable.$inferSelect;
export type InsertOrganizationRecord = typeof organizationsTable.$inferInsert;
