import { z } from "zod";

export const HeroSlideSchema = z.object({
  id: z.string(),
  image: z.string(),
  tag: z.string(),
  title: z.string(),
  location: z.string(),
  specs: z.string(),
  lightingMode: z.string(),
});
export type HeroSlide = z.infer<typeof HeroSlideSchema>;

export const CoreDisciplineSchema = z.object({
  number: z.string(),
  slug: z.string(),
  title: z.string(),
  vietnameseTitle: z.string(),
  description: z.string(),
  specs: z.array(z.string()),
  previewImage: z.string(),
  metricLabel: z.string(),
  metricValue: z.string(),
});
export type CoreDiscipline = z.infer<typeof CoreDisciplineSchema>;

export const ProductionDivisionSchema = z.object({
  id: z.string(),
  name: z.string(),
  headcount: z.string(),
  unitLabel: z.string(),
  role: z.string(),
  equipment: z.string(),
});
export type ProductionDivision = z.infer<typeof ProductionDivisionSchema>;

export const CompanyLegalInfoSchema = z.object({
  fullName: z.string(),
  shortName: z.string(),
  establishedYear: z.number(),
  taxId: z.string(),
  licenseIssuer: z.string(),
  licenseDate: z.string(),
  director: z.string(),
  directorTitle: z.string(),
  factoryAddress: z.string(),
  hotline: z.string(),
  hotlineFormatted: z.string(),
  email: z.string(),
  commitment: z.string(),
});
export type CompanyLegalInfo = z.infer<typeof CompanyLegalInfoSchema>;

export const SiteSettingKeySchema = z.enum([
  "hero_slides",
  "core_disciplines",
  "production_divisions",
  "company_legal_info",
  "gallery_clusters",
]);
export type SiteSettingKey = z.infer<typeof SiteSettingKeySchema>;

export const SiteSettingSchema = z.object({
  key: z.string(),
  valueJson: z.string(),
  updatedAt: z.number().int(),
});
export type SiteSetting = z.infer<typeof SiteSettingSchema>;
