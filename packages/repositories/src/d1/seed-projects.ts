import { initialLandingContent } from "@khangviet/data";
import type { FeaturedProject, ProjectGalleryItem } from "@khangviet/types";
import { type D1Client } from "./client";
import { projectsTable } from "./schema/projects.schema";
import { projectMediaTable } from "./schema/project-media.schema";
import { generateUuidV7 } from "./uuid-v7";

async function seedProjectMediaList(
  client: D1Client,
  projectId: string,
  gallery: ProjectGalleryItem[],
  now: string
): Promise<void> {
  for (let i = 0; i < gallery.length; i++) {
    const item = gallery[i];
    await client.insert(projectMediaTable).values({
      id: item.id || generateUuidV7(),
      projectId,
      mediaType: "GALLERY_IMAGE",
      publicUrl: item.src,
      caption: item.caption,
      location: item.location,
      spec: item.spec,
      aspectRatio: item.aspect,
      sortOrder: i,
      createdAt: now,
    }).onConflictDoNothing();
  }
}

async function seedSingleProject(
  client: D1Client,
  p: FeaturedProject,
  now: string
): Promise<void> {
  const year = typeof p.year === "number" ? p.year : parseInt(String(p.year), 10) || 2026;
  await client.insert(projectsTable).values({
    id: p.id,
    code: p.code,
    title: p.title,
    subtitle: p.subtitle,
    client: p.client,
    locations: p.locations,
    year,
    categoryTag: p.categoryTag,
    scaleMetric: p.scaleMetric,
    materials: p.materials,
    engineeringNotes: p.engineeringNotes,
    summary: p.summary,
    coverImage: p.coverImage,
    status: "PUBLISHED",
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  }).onConflictDoNothing();

  if (p.gallery && p.gallery.length > 0) {
    await seedProjectMediaList(client, p.id, p.gallery, now);
  }
}

export async function seedProjectsAndMedia(client: D1Client, now: string): Promise<void> {
  for (const p of initialLandingContent.featuredProjects) {
    await seedSingleProject(client, p, now);
  }
}
