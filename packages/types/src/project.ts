import { z } from "zod";

export const ProjectGalleryItemSchema = z.object({
  id: z.string(),
  src: z.string(),
  caption: z.string(),
  location: z.string(),
  spec: z.string(),
  aspect: z.enum(["landscape", "portrait", "wide"]),
});
export type ProjectGalleryItem = z.infer<typeof ProjectGalleryItemSchema>;

export const ProjectSegmentSchema = z.enum(["B2B", "C2B"]);
export type ProjectSegment = z.infer<typeof ProjectSegmentSchema>;

export const ProjectStageSchema = z.enum(["COMPLETED", "TENDER_3D"]);
export type ProjectStage = z.infer<typeof ProjectStageSchema>;

export const LandingSlotTypeSchema = z.enum(["HERO_SLIDE", "FEATURED_SHOWCASE"]);
export type LandingSlotType = z.infer<typeof LandingSlotTypeSchema>;

export const ProjectStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

export const ProjectMediaTypeSchema = z.enum([
  "ACTUAL",
  "RENDER_3D",
  "CONSTRUCTION",
  "FLOOR_PLAN",
  "COVER",
  "GALLERY_IMAGE",
  "VIDEO",
]);
export type ProjectMediaType = z.infer<typeof ProjectMediaTypeSchema>;

export const ProjectMediaSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  mediaType: ProjectMediaTypeSchema.default("ACTUAL"),
  r2Key: z.string().optional().nullable(),
  publicUrl: z.string(),
  caption: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  spec: z.string().optional().nullable(),
  aspectRatio: z.string().optional().nullable(),
  widthPx: z.number().int().optional().nullable(),
  heightPx: z.number().int().optional().nullable(),
  fileSizeBytes: z.number().int().optional().nullable(),
  sortOrder: z.number().int().default(0),
  createdAt: z.string(),
});
export type ProjectMedia = z.infer<typeof ProjectMediaSchema>;

export const OrganizationSchema = z.object({
  identityId: z.string(),
  scale: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Organization = z.infer<typeof OrganizationSchema>;

export const KeyAccountSchema = z.object({
  organizationId: z.string(),
  slug: z.string(),
  tag: z.string(),
  sortOrder: z.number().int().default(0),
});
export type KeyAccount = z.infer<typeof KeyAccountSchema>;

export const ProjectComparisonPairSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  label: z.string(),
  renderMediaId: z.string(),
  actualMediaId: z.string(),
  aspectRatio: z.string().default("16/10"),
  sortOrder: z.number().int().default(0),
});
export type ProjectComparisonPair = z.infer<typeof ProjectComparisonPairSchema>;

export const LandingPlacementMetaSchema = z.object({
  lightingMode: z.string().optional(),
  tag: z.string().optional(),
  overrideImage: z.string().optional(),
  overrideTitle: z.string().optional(),
});
export type LandingPlacementMeta = z.infer<typeof LandingPlacementMetaSchema>;

export const LandingPlacementSchema = z.object({
  id: z.string(),
  slotType: LandingSlotTypeSchema,
  projectId: z.string(),
  sortOrder: z.number().int().default(0),
  customMeta: LandingPlacementMetaSchema.optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type LandingPlacement = z.infer<typeof LandingPlacementSchema>;

export const FeaturedProjectSchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  subtitle: z.string(),
  client: z.string(),
  locations: z.array(z.string()),
  year: z.union([z.string(), z.number()]).transform((v) => String(v)),
  categoryTag: z.string(),
  scaleMetric: z.string(),
  materials: z.array(z.string()),
  engineeringNotes: z.array(z.string()),
  summary: z.string(),
  coverImage: z.string(),
  status: ProjectStatusSchema.optional(),
  gallery: z.array(ProjectGalleryItemSchema),
});
export type FeaturedProject = z.infer<typeof FeaturedProjectSchema>;
