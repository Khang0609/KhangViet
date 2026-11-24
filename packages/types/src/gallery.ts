import { z } from "zod";
import {
  OrganizationSchema,
  ProjectComparisonSchema,
  ProjectMediaSchema,
  PublishStatusSchema,
  ServiceSchema,
} from "./project";

export const GalleryClusterConfigSchema = z.object({
  id: z.string(),
  serviceSlug: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
  maxItems: z.number().int().min(1).max(24).default(6),
});
export type GalleryClusterConfig = z.infer<typeof GalleryClusterConfigSchema>;

export const GalleryProjectSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string().nullable().optional(),
  year: z.number().int().nullable().optional(),
  publishStatus: PublishStatusSchema,
  isFeatured: z.boolean(),
  featuredOrder: z.number().int(),
  organization: OrganizationSchema.nullable().optional(),
  services: z.array(ServiceSchema),
  coverMedia: ProjectMediaSchema.nullable().optional(),
  media: z.array(ProjectMediaSchema),
  comparisons: z.array(ProjectComparisonSchema),
});
export type GalleryProject = z.infer<typeof GalleryProjectSchema>;

export const ProjectGalleryResponseSchema = z.object({
  clusters: z.array(GalleryClusterConfigSchema),
  services: z.array(ServiceSchema),
  organizations: z.array(OrganizationSchema),
  projects: z.array(GalleryProjectSchema),
});
export type ProjectGalleryResponse = z.infer<
  typeof ProjectGalleryResponseSchema
>;

export const UpdateGalleryClustersRequestSchema = z.object({
  clusters: z.array(GalleryClusterConfigSchema),
});
export type UpdateGalleryClustersRequest = z.infer<
  typeof UpdateGalleryClustersRequestSchema
>;
