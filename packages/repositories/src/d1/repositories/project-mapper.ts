import type { FeaturedProject, ProjectGalleryItem } from "@khangviet/types";
import type { ProjectRecord } from "../schema/projects.schema";
import type { ProjectMediaRecord } from "../schema/project-media.schema";

export function parseProjectYear(year: string | number | undefined): number {
  return typeof year === "number" ? year : parseInt(String(year), 10) || 2026;
}

export function mapMediaToGalleryItem(m: ProjectMediaRecord): ProjectGalleryItem {
  return {
    id: m.id,
    src: m.publicUrl,
    caption: m.caption ?? "",
    location: m.location ?? "",
    spec: m.spec ?? "",
    aspect: (m.aspectRatio as "landscape" | "portrait" | "wide") || "landscape",
  };
}

export function mapProjectRecordToFeatured(
  p: ProjectRecord,
  mediaList: ProjectMediaRecord[] = []
): FeaturedProject {
  return {
    id: p.id,
    code: p.code,
    title: p.title,
    subtitle: p.subtitle,
    client: p.client,
    locations: p.locations,
    year: String(p.year),
    categoryTag: p.categoryTag,
    scaleMetric: p.scaleMetric,
    materials: p.materials,
    engineeringNotes: p.engineeringNotes,
    summary: p.summary,
    coverImage: p.coverImage,
    gallery: mediaList.map(mapMediaToGalleryItem),
  };
}
