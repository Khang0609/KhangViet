import { z } from "zod";

export const PublishStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export type PublishStatus = z.infer<typeof PublishStatusSchema>;

export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Tên đối tác không được để trống"),
  slug: z.string().min(1),
  description: z.string().nullable().optional(),
  logoKey: z.string().nullable().optional(),
  isFeatured: z.boolean().default(false),
  featuredOrder: z.number().int().min(0).default(0),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
});
export type Organization = z.infer<typeof OrganizationSchema>;

export const CreateOrganizationDtoSchema = z.object({
  name: z.string().trim().min(1, "Tên đối tác không được để trống").max(160),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang")
    .optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  logoKey: z.string().trim().max(500).nullable().optional(),
  isFeatured: z.boolean().default(false),
  featuredOrder: z.number().int().min(0).default(0),
});
export type CreateOrganizationDto = z.infer<typeof CreateOrganizationDtoSchema>;

export const UpdateOrganizationDtoSchema = CreateOrganizationDtoSchema.partial();
export type UpdateOrganizationDto = z.infer<typeof UpdateOrganizationDtoSchema>;

export const ServiceSchema = z.object({
  id: z.string(),
  slug: z.string().min(1),
  name: z.string().min(1),
  sortOrder: z.number().int().min(0).default(0),
});
export type Service = z.infer<typeof ServiceSchema>;

export const ProjectMediaKindSchema = z.enum([
  "RENDER",
  "ACTUAL",
  "HERO",
  "GALLERY",
]);
export type ProjectMediaKind = z.infer<typeof ProjectMediaKindSchema>;

export const ProjectMediaSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  kind: ProjectMediaKindSchema,
  storageKey: z.string().min(1),
  altText: z.string().nullable().optional(),
  caption: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isCover: z.boolean().default(false),
  createdAt: z.number().int(),
});
export type ProjectMedia = z.infer<typeof ProjectMediaSchema>;

export const CreateProjectMediaDtoSchema = z.object({
  kind: ProjectMediaKindSchema.default("GALLERY"),
  storageKey: z.string().trim().min(1),
  altText: z.string().trim().max(255).nullable().optional(),
  caption: z.string().trim().max(500).nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isCover: z.boolean().default(false),
});
export type CreateProjectMediaDto = z.infer<typeof CreateProjectMediaDtoSchema>;

export const ProjectComparisonSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  renderMediaId: z.string(),
  actualMediaId: z.string(),
});
export type ProjectComparison = z.infer<typeof ProjectComparisonSchema>;

export const ProjectSchema = z.object({
  id: z.string(),
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().nullable().optional(),
  organizationId: z.string().nullable().optional(),
  year: z.number().int().min(1990).max(2100).nullable().optional(),
  publishStatus: PublishStatusSchema.default("DRAFT"),
  isFeatured: z.boolean().default(false),
  featuredOrder: z.number().int().min(0).default(0),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
  // Optional hydrated relations for read views
  organization: OrganizationSchema.nullable().optional(),
  services: z.array(ServiceSchema).optional(),
  media: z.array(ProjectMediaSchema).optional(),
  comparisons: z.array(ProjectComparisonSchema).optional(),
});
export type Project = z.infer<typeof ProjectSchema>;

export const CreateProjectDtoSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9-]+$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang")
    .optional(),
  title: z.string().trim().min(1, "Tiêu đề dự án không được để trống").max(200),
  summary: z.string().trim().max(2000).nullable().optional(),
  organizationId: z.string().nullable().optional(),
  year: z.number().int().min(1990).max(2100).nullable().optional(),
  publishStatus: PublishStatusSchema.default("DRAFT"),
  isFeatured: z.boolean().default(false),
  featuredOrder: z.number().int().min(0).default(0),
  serviceIds: z.array(z.string()).default([]),
});
export type CreateProjectDto = z.infer<typeof CreateProjectDtoSchema>;

export const UpdateProjectDtoSchema = CreateProjectDtoSchema.partial();
export type UpdateProjectDto = z.infer<typeof UpdateProjectDtoSchema>;
