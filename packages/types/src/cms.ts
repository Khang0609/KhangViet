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

export const PartnerBrandSchema = z.object({
  name: z.string(),
  subtitle: z.string(),
  category: z.string(),
  logoUrl: z.string().optional(),
});
export type PartnerBrand = z.infer<typeof PartnerBrandSchema>;

export const CoreDisciplineSchema = z.object({
  number: z.string(),
  code: z.string(),
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
  code: z.string(),
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

export const LandingPlacementSlotSchema = z.enum([
  "HERO_SLIDE",
  "FEATURED_SHOWCASE",
]);
export type LandingPlacementSlot = z.infer<typeof LandingPlacementSlotSchema>;

export const LandingPlacementSchema = z.object({
  id: z.string(),
  slotType: LandingPlacementSlotSchema,
  projectId: z.string().min(1, "projectId không được để trống"),
  sortOrder: z.number().int().min(0).default(0),
  customMeta: z.record(z.string(), z.unknown()).optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type LandingPlacement = z.infer<typeof LandingPlacementSchema>;

export const UpsertLandingPlacementSchema = z.object({
  id: z.string().optional(),
  slotType: LandingPlacementSlotSchema,
  projectId: z.string().min(1, "projectId không được để trống"),
  sortOrder: z.number().int().min(0).default(0),
  customMeta: z.record(z.string(), z.unknown()).optional().nullable(),
});
export type UpsertLandingPlacement = z.infer<
  typeof UpsertLandingPlacementSchema
>;
