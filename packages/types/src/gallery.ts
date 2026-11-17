import { z } from "zod";
import {
  PaginationMetaSchema,
  ProjectSegmentSchema,
  ProjectStageSchema,
} from "./project";

/**
 * Phân khúc khách hàng trên trang Project Gallery:
 * - B2B: Chuỗi đối tác, ngân hàng, bán lẻ quy mô lớn
 * - C2B: Khách hàng doanh nghiệp lẻ, showroom, cửa hàng độc lập
 */
export const GallerySegmentSchema = ProjectSegmentSchema;
export type GallerySegment = z.infer<typeof GallerySegmentSchema>;

/**
 * Trạng thái thực thi của công trình trong Gallery:
 * - COMPLETED: Đã thi công & nghiệm thu thực tế
 * - TENDER_3D: Hồ sơ phối cảnh 2D/3D trúng thầu
 */
export const GalleryExecutionStageSchema = ProjectStageSchema;
export type GalleryExecutionStage = z.infer<typeof GalleryExecutionStageSchema>;

/**
 * Thương hiệu đối tác chuỗi (Key Account) dùng cho bộ lọc nhanh
 */
export const GalleryKeyAccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  tag: z.string(),
  scale: z.string(),
  desc: z.string(),
  segment: GallerySegmentSchema.default("B2B"),
  logoUrl: z.string().optional().nullable(),
});
export type GalleryKeyAccount = z.infer<typeof GalleryKeyAccountSchema>;

/**
 * Mẫu bố cục Bento Grid chuẩn (dùng chung cho Frontend Gallery & Admin Slot Picker)
 */
export const BentoLayoutPresetSchema = z.enum([
  "hero-left",
  "asymmetric-mosaic",
  "panoramic-trio",
  "editorial-split",
]);
export type BentoLayoutPreset = z.infer<typeof BentoLayoutPresetSchema>;

/**
 * Biến thể nền bề mặt cho từng cụm Bento theo quy tắc 60-30-10
 */
export const ClusterSurfaceToneSchema = z.enum(["ivory", "stone", "charcoal"]);
export type ClusterSurfaceTone = z.infer<typeof ClusterSurfaceToneSchema>;

/**
 * Điểm lấy nét ảnh bìa (tọa độ phần trăm 0-100) để object-cover không cắt lệch chủ thể
 */
export const GalleryFocalPointSchema = z.object({
  x: z.number().min(0).max(100).default(50),
  y: z.number().min(0).max(100).default(50),
});
export type GalleryFocalPoint = z.infer<typeof GalleryFocalPointSchema>;

/**
 * Cấu hình hiển thị một cụm Bento trên Tầng 1 Gallery (tương thích Admin CMS)
 */
export const GalleryClusterConfigSchema = z.object({
  id: z.string(),
  groupType: z.enum(["partner", "solution"]),
  groupKey: z.string(),
  slug: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  layoutPreset: BentoLayoutPresetSchema.default("hero-left"),
  surfaceTone: ClusterSurfaceToneSchema.default("ivory"),
  accentColor: z.string().optional(),
  slotProjectIds: z.array(z.string()).default([]),
  sortOrder: z.number().default(0),
});
export type GalleryClusterConfig = z.infer<typeof GalleryClusterConfigSchema>;

/**
 * Contract chuẩn cho một dự án hiển thị trên Project Gallery
 */
export const GalleryProjectSchema = z.object({
  id: z.string(),
  code: z.string().optional(),
  title: z.string(),
  client: z.string(),
  keyAccount: z.string().optional().nullable(),
  segment: GallerySegmentSchema,
  stage: GalleryExecutionStageSchema,
  category: z.string(),
  location: z.string(),
  material: z.string(),
  team: z.string(),
  imgActual: z.string(),
  img3D: z.string().optional().nullable(),
  focalPoint: GalleryFocalPointSchema.optional(),
  desc: z.string(),
  year: z
    .union([z.string(), z.number()])
    .transform((v) => String(v))
    .optional(),
  featured: z.boolean().default(false),
});
export type GalleryProject = z.infer<typeof GalleryProjectSchema>;

/**
 * Trạng thái bộ lọc URL / Client state cho Project Gallery
 */
export const GalleryFilterStateSchema = z.object({
  segment: z.enum(["ALL", "B2B", "C2B"]).default("ALL"),
  stage: z.enum(["ALL", "COMPLETED", "TENDER_3D"]).default("ALL"),
  keyAccount: z.string().default("ALL"),
  category: z.string().default("ALL"),
  search: z.string().default(""),
});
export type GalleryFilterState = z.infer<typeof GalleryFilterStateSchema>;

/**
 * Chỉ số năng lực nhanh hiển thị ở Hero Summary của Project Gallery
 */
export const GalleryStatsSchema = z.object({
  totalProjectsLabel: z.string(),
  b2bBrandsLabel: z.string(),
  experienceYearsLabel: z.string(),
});
export type GalleryStats = z.infer<typeof GalleryStatsSchema>;

/**
 * Payload trả về cho trang Project Gallery
 */
export const ProjectGalleryResponseSchema = z.object({
  projects: z.array(GalleryProjectSchema),
  keyAccounts: z.array(GalleryKeyAccountSchema),
  categories: z.array(z.string()),
  stats: GalleryStatsSchema.optional(),
  clusters: z.array(GalleryClusterConfigSchema).optional(),
});
export type ProjectGalleryResponse = z.infer<
  typeof ProjectGalleryResponseSchema
>;

/**
 * Payload chuẩn trả về từ endpoint GET /api/v1/content/gallery
 */
export const GalleryApiResponseSchema = z.object({
  items: z.array(GalleryProjectSchema),
  pagination: PaginationMetaSchema,
  keyAccounts: z.array(GalleryKeyAccountSchema),
  categories: z.array(z.string()),
  stats: GalleryStatsSchema.optional(),
  clusters: z.array(GalleryClusterConfigSchema).optional(),
});
export type GalleryApiResponse = z.infer<typeof GalleryApiResponseSchema>;
