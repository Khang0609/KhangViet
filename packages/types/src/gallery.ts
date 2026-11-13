import { z } from "zod";

/**
 * Phân khúc khách hàng trên trang Project Gallery:
 * - B2B: Chuỗi đối tác, ngân hàng, bán lẻ quy mô lớn
 * - C2B: Khách hàng doanh nghiệp lẻ, showroom, cửa hàng độc lập
 */
export const GallerySegmentSchema = z.enum(["B2B", "C2B"]);
export type GallerySegment = z.infer<typeof GallerySegmentSchema>;

/**
 * Trạng thái thực thi của công trình trong Gallery:
 * - COMPLETED: Đã thi công & nghiệm thu thực tế
 * - TENDER_3D: Hồ sơ phối cảnh 2D/3D trúng thầu
 */
export const GalleryExecutionStageSchema = z.enum(["COMPLETED", "TENDER_3D"]);
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
});
export type ProjectGalleryResponse = z.infer<
  typeof ProjectGalleryResponseSchema
>;
