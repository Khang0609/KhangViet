import { eq, asc, and } from "drizzle-orm";
import { initialLandingContent } from "@khangviet/data";
import type {
  LandingContent,
  FeaturedProject,
  ProjectDetail,
  ProjectListQuery,
  PaginationMeta,
  GalleryApiResponse,
  HeroSlide,
  CompanyLegalInfo,
  PendingChange,
  ChangeActionType,
  SyncStatus,
  ProjectGalleryItem,
  LandingPlacement,
  LandingPlacementSlot,
  UpsertLandingPlacement,
} from "@khangviet/types";
import { ICmsRepository } from "../../interfaces/ICmsRepository";
import { type D1Client } from "../client";
import { generateUuidV7 } from "../uuid-v7";
import { projectsTable, type ProjectRecord } from "../schema/projects.schema";
import { projectMediaTable, type ProjectMediaRecord } from "../schema/project-media.schema";
import { cmsMetadataTable } from "../schema/cms.schema";

function parseYear(year: string | number | undefined): number {
  return typeof year === "number" ? year : parseInt(String(year), 10) || 2026;
}

function mapMediaToGallery(m: ProjectMediaRecord): ProjectGalleryItem {
  return {
    id: m.id,
    src: m.publicUrl,
    caption: m.caption ?? "",
    location: m.location ?? "",
    spec: m.spec ?? "",
    aspect: (m.aspectRatio as "landscape" | "portrait" | "wide") || "landscape",
  };
}

function mapProject(p: ProjectRecord, mediaList: ProjectMediaRecord[] = []): FeaturedProject {
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
    status: "PUBLISHED",
    gallery: mediaList.map(mapMediaToGallery),
  };
}

/**
 * Repository quản lý toàn bộ nội dung CMS trên Cloudflare D1.
 * Tuân thủ quy chuẩn High Cohesion: Tập trung logic Projects, Hero và Legal Metadata trong một module duy nhất.
 * Hỗ trợ cơ chế DRAFT / PUBLISHED tự nhiên.
 */
export class D1CmsRepository implements ICmsRepository {
  private readonly client: D1Client;

  constructor(client: D1Client) {
    this.client = client;
  }

  // --- Landing & Projects ---

  async getLandingData(): Promise<LandingContent> {
    const [projects, heroSlides, legalInfo] = await Promise.all([
      this.getProjects(false), // Public: chỉ lấy PUBLISHED
      this.getHeroSlides(false),
      this.getLegalInfo(false),
    ]);
    return {
      ...initialLandingContent,
      heroSlides,
      featuredProjects: projects.length > 0 ? projects : initialLandingContent.featuredProjects,
      companyLegalInfo: legalInfo,
    };
  }

  async getProjects(_includeDrafts: boolean = false): Promise<FeaturedProject[]> {
    const projects = await this.client.select().from(projectsTable);

    const media = await this.client.select().from(projectMediaTable).orderBy(asc(projectMediaTable.sortOrder));
    const mediaMap = new Map<string, ProjectMediaRecord[]>();
    for (const m of media) {
      const list = mediaMap.get(m.projectId) || [];
      list.push(m);
      mediaMap.set(m.projectId, list);
    }
    return projects.map((p) => mapProject(p, mediaMap.get(p.id) || []));
  }

  async getProjectById(id: string): Promise<FeaturedProject | null> {
    const records = await this.client.select().from(projectsTable).where(eq(projectsTable.id, id)).limit(1);
    if (!records[0]) return null;
    const media = await this.client.select().from(projectMediaTable).where(eq(projectMediaTable.projectId, id)).orderBy(asc(projectMediaTable.sortOrder));
    return mapProject(records[0], media);
  }

  async createProject(data: Omit<FeaturedProject, "id"> & { id?: string }): Promise<FeaturedProject> {
    const id = data.id || generateUuidV7();
    const now = new Date().toISOString();
    await this.client.insert(projectsTable).values({
      id,
      code: data.code,
      title: data.title,
      subtitle: data.subtitle,
      client: data.client,
      locations: data.locations,
      year: parseYear(data.year),
      categoryTag: data.categoryTag,
      scaleMetric: data.scaleMetric,
      materials: data.materials,
      engineeringNotes: data.engineeringNotes,
      summary: data.summary,
      coverImage: data.coverImage,
      createdAt: now,
      updatedAt: now,
    });

    if (data.gallery && data.gallery.length > 0) {
      await this.syncMedia(id, data.gallery, now);
    }
    return (await this.getProjectById(id))!;
  }

  async updateProject(id: string, data: Partial<FeaturedProject>): Promise<FeaturedProject | null> {
    const { gallery, ...fields } = data;
    const now = new Date().toISOString();
    const updateValues: Record<string, unknown> = {
      updatedAt: now,
    };
    if (fields.year !== undefined) updateValues.year = parseYear(fields.year);
    for (const [k, v] of Object.entries(fields)) {
      if (k !== "year" && v !== undefined) updateValues[k] = v;
    }

    if (Object.keys(updateValues).length > 1) {
      await this.client.update(projectsTable).set(updateValues).where(eq(projectsTable.id, id));
    }
    if (gallery !== undefined) {
      await this.syncMedia(id, gallery, now);
    }
    return this.getProjectById(id);
  }

  async deleteProject(id: string): Promise<boolean> {
    const deleted = await this.client.delete(projectsTable).where(eq(projectsTable.id, id)).returning({ id: projectsTable.id });
    return deleted.length > 0;
  }

  private async syncMedia(projectId: string, gallery: ProjectGalleryItem[], now: string): Promise<void> {
    await this.client.delete(projectMediaTable).where(and(eq(projectMediaTable.projectId, projectId), eq(projectMediaTable.mediaType, "GALLERY_IMAGE")));
    for (let i = 0; i < gallery.length; i++) {
      const item = gallery[i];
      await this.client.insert(projectMediaTable).values({
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
      });
    }
  }

  // --- Hero Slides & Legal Metadata (Draft / Published Keys) ---

  async getHeroSlides(includeDraft: boolean = true): Promise<HeroSlide[]> {
    if (includeDraft) {
      const draft = await this.client.select().from(cmsMetadataTable).where(eq(cmsMetadataTable.key, "hero_slides:draft")).limit(1);
      if (draft[0]) return JSON.parse(draft[0].valueJson);
    }
    const row = await this.client.select().from(cmsMetadataTable).where(eq(cmsMetadataTable.key, "hero_slides")).limit(1);
    return row[0] ? JSON.parse(row[0].valueJson) : initialLandingContent.heroSlides;
  }

  async updateHeroSlides(slides: HeroSlide[]): Promise<HeroSlide[]> {
    const now = new Date().toISOString();
    await this.client.insert(cmsMetadataTable).values({ key: "hero_slides:draft", valueJson: JSON.stringify(slides), updatedAt: now })
      .onConflictDoUpdate({ target: cmsMetadataTable.key, set: { valueJson: JSON.stringify(slides), updatedAt: now } });
    return slides;
  }

  async getLegalInfo(includeDraft: boolean = true): Promise<CompanyLegalInfo> {
    if (includeDraft) {
      const draft = await this.client.select().from(cmsMetadataTable).where(eq(cmsMetadataTable.key, "legal_info:draft")).limit(1);
      if (draft[0]) return JSON.parse(draft[0].valueJson);
    }
    const row = await this.client.select().from(cmsMetadataTable).where(eq(cmsMetadataTable.key, "legal_info")).limit(1);
    return row[0] ? JSON.parse(row[0].valueJson) : initialLandingContent.companyLegalInfo;
  }

  async updateLegalInfo(info: Partial<CompanyLegalInfo>): Promise<CompanyLegalInfo> {
    const current = await this.getLegalInfo(true);
    const updated = { ...current, ...info };
    const now = new Date().toISOString();
    await this.client.insert(cmsMetadataTable).values({ key: "legal_info:draft", valueJson: JSON.stringify(updated), updatedAt: now })
      .onConflictDoUpdate({ target: cmsMetadataTable.key, set: { valueJson: JSON.stringify(updated), updatedAt: now } });
    return updated;
  }

  // --- Sync & Publish Engine ---

  async applyPendingChanges(): Promise<{ appliedCount: number; success: boolean }> {
    const now = new Date().toISOString();

    // 1. Projects không còn cơ chế DRAFT -> PUBLISHED (cập nhật trực tiếp)
    const updatedProjects: { id: string }[] = [];

    // 2. Thăng hạng metadata drafts -> live keys
    const allMeta = await this.client.select().from(cmsMetadataTable).all();
    let updatedMetaCount = 0;

    for (const row of allMeta) {
      if (row.key.endsWith(":draft")) {
        const liveKey = row.key.replace(":draft", "");
        await this.client.insert(cmsMetadataTable).values({ key: liveKey, valueJson: row.valueJson, updatedAt: now })
          .onConflictDoUpdate({ target: cmsMetadataTable.key, set: { valueJson: row.valueJson, updatedAt: now } });
        await this.client.delete(cmsMetadataTable).where(eq(cmsMetadataTable.key, row.key));
        updatedMetaCount++;
      }
    }

    return { appliedCount: updatedProjects.length + updatedMetaCount, success: true };
  }

  async getSyncStatus(): Promise<SyncStatus> {
    const allProjects = await this.getProjects(true);
    const draftProjectsCount = allProjects.filter((p) => p.status === "DRAFT").length;

    const allMeta = await this.client.select().from(cmsMetadataTable).all();
    const draftMetaCount = allMeta.filter((r) => r.key.endsWith(":draft")).length;

    const pendingCount = draftProjectsCount + draftMetaCount;
    const now = new Date();
    const currentHourVN = (now.getUTCHours() + 7) % 24;

    return {
      isMidnightWindow: currentHourVN >= 0 && currentHourVN < 2,
      hasPendingChanges: pendingCount > 0,
      pendingCount,
      serverTime: now.toISOString(),
      currentHourVN,
    };
  }

  // Compatibility stubs
  async getPendingChanges(): Promise<PendingChange[]> { return []; }
  async enqueueChange(): Promise<PendingChange> { return {} as PendingChange; }
  async discardPendingChange(): Promise<boolean> { return true; }

  // Gallery / Placement stubs (D1 schema migration handled separately)
  async queryProjects(
    query: ProjectListQuery
  ): Promise<{ items: FeaturedProject[]; pagination: PaginationMeta }> {
    const all = await this.getProjects(false);
    const total = all.length;
    const start = (query.page - 1) * query.limit;
    return {
      items: all.slice(start, start + query.limit),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
      },
    };
  }

  async getGalleryData(query: ProjectListQuery): Promise<GalleryApiResponse> {
    return {
      items: [],
      pagination: { page: query.page, limit: query.limit, total: 0, totalPages: 0 },
      keyAccounts: [],
      categories: [],
    };
  }

  async getProjectDetailById(id: string): Promise<ProjectDetail | null> {
    const p = await this.getProjectById(id);
    if (!p) return null;
    return { ...p, media: [], comparisonPairs: [] };
  }

  async getPlacements(_slotType?: LandingPlacementSlot): Promise<LandingPlacement[]> {
    return [];
  }

  async upsertPlacement(_input: UpsertLandingPlacement): Promise<LandingPlacement> {
    throw new Error("D1 placements migration not yet applied");
  }

  async deletePlacement(_id: string): Promise<boolean> {
    return false;
  }
}
