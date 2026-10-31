import type { FeaturedProject } from "@khangviet/types";

/**
 * Mẫu dự án mặc định khi tạo mới trên CMS
 */
export const defaultEmptyProject: FeaturedProject = {
  id: "",
  code: "KV-PRJ-NEW",
  title: "",
  subtitle: "Công trình kiến trúc",
  client: "",
  locations: ["TP. Hồ Chí Minh"],
  year: "2026",
  categoryTag: "Kiến trúc",
  scaleMetric: "500 m²",
  materials: ["Khung thép tiền chế", "Kính cường lực"],
  engineeringNotes: ["Gia công cơ khí CNC"],
  summary: "",
  coverImage: "",
  gallery: [],
};

