import { eq, asc, and } from "drizzle-orm";
import type { FeaturedProject, ProjectGalleryItem } from "@khangviet/types";
import { type D1Client } from "../client";
import { generateUuidV7 } from "../uuid-v7";
import { projectsTable } from "../schema/projects.schema";
import { projectMediaTable, type ProjectMediaRecord } from "../schema/project-media.schema";
import { mapProjectRecordToFeatured, parseProjectYear } from "./project-mapper";

async function syncProjectMedia(client: D1Client, projectId: string, gallery: ProjectGalleryItem[], now: string): Promise<void> {
  await client.delete(projectMediaTable)
    .where(and(eq(projectMediaTable.projectId, projectId), eq(projectMediaTable.mediaType, "GALLERY_IMAGE")));
  for (let i = 0; i < gallery.length; i++) {
    const item = gallery[i];
    await client.insert(projectMediaTable).values({
      id: item.id || generateUuidV7(), projectId, mediaType: "GALLERY_IMAGE", publicUrl: item.src,
      caption: item.caption, location: item.location, spec: item.spec, aspectRatio: item.aspect, sortOrder: i, createdAt: now,
    });
  }
}

export class D1CmsProjectRepo {
  private readonly client: D1Client;
  constructor(client: D1Client) { this.client = client; }

  async getProjects(): Promise<FeaturedProject[]> {
    const projects = await this.client.select().from(projectsTable);
    const media = await this.client.select().from(projectMediaTable).orderBy(asc(projectMediaTable.sortOrder));
    const mediaMap = new Map<string, ProjectMediaRecord[]>();
    for (const m of media) {
      const list = mediaMap.get(m.projectId) || [];
      list.push(m);
      mediaMap.set(m.projectId, list);
    }
    return projects.map((p) => mapProjectRecordToFeatured(p, mediaMap.get(p.id) || []));
  }

  async getProjectById(id: string): Promise<FeaturedProject | null> {
    const records = await this.client.select().from(projectsTable).where(eq(projectsTable.id, id)).limit(1);
    if (!records[0]) return null;
    const media = await this.client.select().from(projectMediaTable).where(eq(projectMediaTable.projectId, id)).orderBy(asc(projectMediaTable.sortOrder));
    return mapProjectRecordToFeatured(records[0], media);
  }

  async createProject(data: Omit<FeaturedProject, "id"> & { id?: string }): Promise<FeaturedProject> {
    const id = data.id || generateUuidV7();
    const now = new Date().toISOString();
    await this.client.insert(projectsTable).values({
      id, code: data.code, title: data.title, subtitle: data.subtitle, client: data.client, locations: data.locations,
      year: parseProjectYear(data.year), categoryTag: data.categoryTag, scaleMetric: data.scaleMetric,
      materials: data.materials, engineeringNotes: data.engineeringNotes, summary: data.summary, coverImage: data.coverImage,
      status: "PUBLISHED", sortOrder: 0, createdAt: now, updatedAt: now,
    });
    if (data.gallery && data.gallery.length > 0) {
      await syncProjectMedia(this.client, id, data.gallery, now);
    }
    return (await this.getProjectById(id))!;
  }

  async updateProject(id: string, data: Partial<FeaturedProject>): Promise<FeaturedProject | null> {
    const { gallery, ...fields } = data;
    const now = new Date().toISOString();
    const updateValues: Record<string, unknown> = { updatedAt: now };
    if (fields.year !== undefined) updateValues.year = parseProjectYear(fields.year);
    for (const [k, v] of Object.entries(fields)) {
      if (k !== "year" && v !== undefined) updateValues[k] = v;
    }
    if (Object.keys(updateValues).length > 1) {
      await this.client.update(projectsTable).set(updateValues).where(eq(projectsTable.id, id));
    }
    if (gallery !== undefined) {
      await syncProjectMedia(this.client, id, gallery, now);
    }
    return this.getProjectById(id);
  }

  async deleteProject(id: string): Promise<boolean> {
    const deleted = await this.client.delete(projectsTable).where(eq(projectsTable.id, id)).returning({ id: projectsTable.id });
    return deleted.length > 0;
  }
}
