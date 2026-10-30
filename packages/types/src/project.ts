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

export const FeaturedProjectSchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  subtitle: z.string(),
  client: z.string(),
  locations: z.array(z.string()),
  year: z.string(),
  categoryTag: z.string(),
  scaleMetric: z.string(),
  materials: z.array(z.string()),
  engineeringNotes: z.array(z.string()),
  summary: z.string(),
  coverImage: z.string(),
  gallery: z.array(ProjectGalleryItemSchema),
});
export type FeaturedProject = z.infer<typeof FeaturedProjectSchema>;
