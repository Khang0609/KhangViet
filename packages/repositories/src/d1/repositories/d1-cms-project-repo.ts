import { eq } from "drizzle-orm";
import type { FeaturedProject } from "@khangviet/types";
import { type D1Client } from "../client";
import { generateUuidV7 } from "../uuid-v7";
import { projectsTable, type ProjectRecord } from "../schema/projects.schema";

export function mapToFeaturedProject(r: ProjectRecord): FeaturedProject {
  return {
    id: r.id,
    code: r.code,
    title: r.title,
    subtitle: r.subtitle,
    client: r.client,
    locations: r.locations,
    year: r.year,
    categoryTag: r.categoryTag,
    scaleMetric: r.scaleMetric,
    materials: r.materials,
    engineeringNotes: r.engineeringNotes,
    summary: r.summary,
    coverImage: r.coverImage,
    gallery: r.gallery,
  };
}

export class D1CmsProjectRepo {
  constructor(private readonly client: D1Client) {}

  async getProjects(): Promise<FeaturedProject[]> {
    const records = await this.client.select().from(projectsTable);
    return records.map(mapToFeaturedProject);
  }

  async getProjectById(id: string): Promise<FeaturedProject | null> {
    const records = await this.client
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, id))
      .limit(1);

    return records[0] ? mapToFeaturedProject(records[0]) : null;
  }

  async createProject(
    data: Omit<FeaturedProject, "id"> & { id?: string }
  ): Promise<FeaturedProject> {
    const record: ProjectRecord = {
      ...data,
      id: data.id || generateUuidV7(),
    };
    await this.client.insert(projectsTable).values(record);
    return mapToFeaturedProject(record);
  }

  async updateProject(
    id: string,
    data: Partial<FeaturedProject>
  ): Promise<FeaturedProject | null> {
    const updated = await this.client
      .update(projectsTable)
      .set(data)
      .where(eq(projectsTable.id, id))
      .returning();

    return updated[0] ? mapToFeaturedProject(updated[0]) : null;
  }

  async deleteProject(id: string): Promise<boolean> {
    const deleted = await this.client
      .delete(projectsTable)
      .where(eq(projectsTable.id, id))
      .returning({ id: projectsTable.id });

    return deleted.length > 0;
  }
}
