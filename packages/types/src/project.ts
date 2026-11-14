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

export const ProjectStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

export const ProjectSegmentSchema = z.enum(["B2B", "C2B"]);
export type ProjectSegment = z.infer<typeof ProjectSegmentSchema>;

export const ProjectStageSchema = z.enum(["COMPLETED", "TENDER_3D"]);
export type ProjectStage = z.infer<typeof ProjectStageSchema>;

export const LandingSlotTypeSchema = z.enum([
  "HERO_SLIDE",
  "FEATURED_SHOWCASE",
]);
export type LandingSlotType = z.infer<typeof LandingSlotTypeSchema>;

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
  label: z.string().optional().default(""),
  title: z.string().optional().nullable(),
  renderMediaId: z.string(),
  actualMediaId: z.string(),
  aspectRatio: z.string().default("16/10"),
  sortOrder: z.number().int().default(0),
  renderUrl: z.string().optional(),
  actualUrl: z.string().optional(),
});
export type ProjectComparisonPair = z.infer<typeof ProjectComparisonPairSchema>;

export const LandingPlacementMetaSchema = z.object({
  lightingMode: z.string().optional(),
  tag: z.string().optional(),
  overrideImage: z.string().optional(),
  overrideTitle: z.string().optional(),
  slideId: z.string().optional(),
  image: z.string().optional(),
  title: z.string().optional(),
  location: z.string().optional(),
  specs: z.string().optional(),
});
export type LandingPlacementMeta = z.infer<typeof LandingPlacementMetaSchema>;

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
  segment: ProjectSegmentSchema.optional(),
  stage: ProjectStageSchema.optional(),
  keyAccountId: z.string().optional().nullable(),
  teamAndTimeline: z.string().optional().nullable(),
  status: ProjectStatusSchema.optional(),
  gallery: z.array(ProjectGalleryItemSchema),
});
export type FeaturedProject = z.infer<typeof FeaturedProjectSchema>;

export const ProjectDetailSchema = FeaturedProjectSchema.extend({
  media: z.array(ProjectMediaSchema),
  comparisonPairs: z.array(ProjectComparisonPairSchema),
});
export type ProjectDetail = z.infer<typeof ProjectDetailSchema>;

export const PaginationMetaSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

export const ProjectListQuerySchema = z.object({
  segment: z.enum(["ALL", "B2B", "C2B"]).optional(),
  stage: z.enum(["ALL", "COMPLETED", "TENDER_3D"]).optional(),
  categoryTag: z.string().trim().min(1).optional(),
  keyAccount: z.string().trim().min(1).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});
export type ProjectListQuery = z.infer<typeof ProjectListQuerySchema>;
