import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const siteSettingsTable = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  valueJson: text("value_json").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export type SiteSettingRecord = typeof siteSettingsTable.$inferSelect;
export type InsertSiteSettingRecord = typeof siteSettingsTable.$inferInsert;
