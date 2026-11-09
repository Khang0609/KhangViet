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

export const ProjectMediaTypeSchema = z.enum([
  "COVER",
  "GALLERY_IMAGE",
  "FLOOR_PLAN",
  "VIDEO",
]);
export type ProjectMediaType = z.infer<typeof ProjectMediaTypeSchema>;

export const ProjectMediaSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  mediaType: ProjectMediaTypeSchema.default("GALLERY_IMAGE"),
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
  gallery: z.array(ProjectGalleryItemSchema),
});
export type FeaturedProject = z.infer<typeof FeaturedProjectSchema>;
