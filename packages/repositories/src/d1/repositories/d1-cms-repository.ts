import { eq, asc, and, like, or, sql, inArray } from "drizzle-orm";
import { initialLandingContent } from "@khangviet/data";
import type {
  LandingContent,
  FeaturedProject,
  ProjectDetail,
  ProjectListQuery,
  PaginationMeta,
  GalleryApiResponse,
  GalleryClusterConfig,
  GalleryProject,
  GalleryKeyAccount,
  HeroSlide,
  CompanyLegalInfo,
  ProjectGalleryItem,
  ProjectMedia,
  ProjectComparisonPair,
  LandingPlacement,
  LandingPlacementSlot,
  LandingPlacementMeta,
  UpsertLandingPlacement,
} from "@khangviet/types";
import { ICmsRepository } from "../../interfaces/ICmsRepository";
import { type D1Client } from "../client";
import { generateUuidV7 } from "../uuid-v7";
import { projectsTable, type ProjectRecord } from "../schema/projects.schema";
import { projectMediaTable, type ProjectMediaRecord } from "../schema/project-media.schema";
import { projectComparisonsTable } from "../schema/project-comparisons.schema";
import { landingPlacementsTable } from "../schema/landing-placements.schema";
import { keyAccountsTable } from "../schema/key-accounts.schema";
import { organizationsTable } from "../schema/organizations.schema";
import { identitiesTable } from "../schema/identities.schema";
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

function mapMediaRecord(m: ProjectMediaRecord): ProjectMedia {
  return {
    id: m.id,
    projectId: m.projectId,
    mediaType: m.mediaType,
    r2Key: m.r2Key,
    publicUrl: m.publicUrl,
    caption: m.caption,
    location: m.location,
    spec: m.spec,
    aspectRatio: m.aspectRatio,
    widthPx: m.widthPx,
    heightPx: m.heightPx,
    fileSizeBytes: m.fileSizeBytes,
    sortOrder: m.sortOrder,
    createdAt: m.createdAt,
  };
}

function mapProject(
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
    segment: p.segment,
    stage: p.stage,
    keyAccountId: p.keyAccountId,
    teamAndTimeline: p.teamAndTimeline,
    gallery: mediaList.map(mapMediaToGallery),
  };
}

function buildProjectWhereConditions(query: ProjectListQuery) {
  const conditions = [];
  if (query.segment && query.segment !== "ALL") {
    conditions.push(eq(projectsTable.segment, query.segment));
  }
  if (query.stage && query.stage !== "ALL") {
    conditions.push(eq(projectsTable.stage, query.stage));
  }
  if (query.categoryTag && query.categoryTag !== "ALL") {
    conditions.push(eq(projectsTable.categoryTag, query.categoryTag));
  }
  if (query.keyAccount && query.keyAccount !== "ALL") {
    conditions.push(eq(projectsTable.keyAccountId, query.keyAccount));
  }
  if (query.search && query.search.trim().length > 0) {
    const pattern = `%${query.search.trim()}%`;
    conditions.push(
      or(
        like(projectsTable.title, pattern),
        like(projectsTable.client, pattern),
        like(projectsTable.code, pattern),
        like(projectsTable.categoryTag, pattern)
      )!
    );
  }
  return conditions.length > 0 ? and(...conditions) : undefined;
}

/**
 * Repository quản lý toàn bộ nội dung CMS & Gallery trên Cloudflare D1.
 */
export class D1CmsRepository implements ICmsRepository {
  private readonly client: D1Client;

  constructor(client: D1Client) {
    this.client = client;
  }

  async getLandingData(): Promise<LandingContent> {
    const [heroSlides, featuredPlacements, legalInfo] = await Promise.all([
      this.getHeroSlides(),
      this.getPlacements("FEATURED_SHOWCASE"),
      this.getLegalInfo(),
    ]);

    let featuredProjects: FeaturedProject[] = [];
    if (featuredPlacements.length > 0) {
      const projectIds = featuredPlacements.map((pl) => pl.projectId);
      const [rows, media] = await Promise.all([
        this.client
          .select()
          .from(projectsTable)
          .where(inArray(projectsTable.id, projectIds)),
        this.client
          .select()
          .from(projectMediaTable)
          .where(inArray(projectMediaTable.projectId, projectIds))
          .orderBy(asc(projectMediaTable.sortOrder)),
      ]);
      const mediaMap = this.groupMediaByProject(media);
      const rowMap = new Map(rows.map((r) => [r.id, r]));
      featuredProjects = featuredPlacements
        .map((pl) => rowMap.get(pl.projectId))
        .filter((r): r is ProjectRecord => Boolean(r))
        .map((r) => mapProject(r, mediaMap.get(r.id) || []));
    } else {
      featuredProjects = await this.getProjects();
    }

    return {
      ...initialLandingContent,
      heroSlides,
      featuredProjects:
        featuredProjects.length > 0
          ? featuredProjects
          : initialLandingContent.featuredProjects,
      companyLegalInfo: legalInfo,
    };
  }

  private groupMediaByProject(media: ProjectMediaRecord[]) {
    const mediaMap = new Map<string, ProjectMediaRecord[]>();
    for (const m of media) {
      const list = mediaMap.get(m.projectId) || [];
      list.push(m);
      mediaMap.set(m.projectId, list);
    }
    return mediaMap;
  }

  async getProjects(): Promise<FeaturedProject[]> {
    const [projects, media] = await Promise.all([
      this.client.select().from(projectsTable),
      this.client
        .select()
        .from(projectMediaTable)
        .orderBy(asc(projectMediaTable.sortOrder)),
    ]);
    const mediaMap = this.groupMediaByProject(media);
    return projects.map((p) => mapProject(p, mediaMap.get(p.id) || []));
  }

  async queryProjects(
    query: ProjectListQuery
  ): Promise<{ items: FeaturedProject[]; pagination: PaginationMeta }> {
    const whereClause = buildProjectWhereConditions(query);
    const offset = (query.page - 1) * query.limit;

    const [countRows, rows] = await Promise.all([
      this.client
        .select({ count: sql<number>`count(*)` })
        .from(projectsTable)
        .where(whereClause),
      this.client
        .select()
        .from(projectsTable)
        .where(whereClause)
        .limit(query.limit)
        .offset(offset),
    ]);

    const total = Number(countRows[0]?.count ?? 0);
    const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit);

    let mediaMap = new Map<string, ProjectMediaRecord[]>();
    if (rows.length > 0) {
      const ids = rows.map((r) => r.id);
      const media = await this.client
        .select()
        .from(projectMediaTable)
        .where(inArray(projectMediaTable.projectId, ids))
        .orderBy(asc(projectMediaTable.sortOrder));
      mediaMap = this.groupMediaByProject(media);
    }

    return {
      items: rows.map((p) => mapProject(p, mediaMap.get(p.id) || [])),
      pagination: { page: query.page, limit: query.limit, total, totalPages },
    };
  }

  async getGalleryData(query: ProjectListQuery): Promise<GalleryApiResponse> {
    const [{ items: projectItems, pagination }, keyAccountRows, categoryRows] =
      await Promise.all([
        this.queryProjects(query),
        this.client
          .select({
            id: keyAccountsTable.organizationId,
            name: identitiesTable.fullName,
            tag: keyAccountsTable.tag,
            scale: organizationsTable.scale,
            desc: organizationsTable.description,
            logoUrl: organizationsTable.logoUrl,
          })
          .from(keyAccountsTable)
          .innerJoin(
            organizationsTable,
            eq(keyAccountsTable.organizationId, organizationsTable.identityId)
          )
          .innerJoin(
            identitiesTable,
            eq(organizationsTable.identityId, identitiesTable.id)
          )
          .orderBy(asc(keyAccountsTable.sortOrder)),
        this.client
          .selectDistinct({ categoryTag: projectsTable.categoryTag })
          .from(projectsTable),
      ]);

    const keyAccountNameMap = new Map(
      keyAccountRows.map((ka) => [ka.id, ka.name])
    );

    const items: GalleryProject[] = projectItems.map((p) => ({
      id: p.id,
      code: p.code,
      title: p.title,
      client: p.client,
      keyAccount: p.keyAccountId
        ? (keyAccountNameMap.get(p.keyAccountId) ?? p.keyAccountId)
        : null,
      segment: p.segment ?? "B2B",
      stage: p.stage ?? "COMPLETED",
      category: p.categoryTag,
      location: p.locations.join(" • "),
      material: p.materials.slice(0, 2).join(", "),
      team: p.teamAndTimeline ?? "Đội ngũ Khang Việt",
      imgActual: p.coverImage,
      img3D: p.gallery[0]?.src ?? p.coverImage,
      desc: p.summary,
      year: p.year,
      featured: false,
    }));

    const keyAccounts: GalleryKeyAccount[] = keyAccountRows.map((ka) => ({
      id: ka.id,
      name: ka.name,
      tag: ka.tag,
      scale: ka.scale ?? "",
      desc: ka.desc ?? "",
      segment: "B2B",
      logoUrl: ka.logoUrl,
    }));

    const clusters = await this.getGalleryClusters();

    return {
      items,
      pagination,
      keyAccounts,
      categories: categoryRows.map((c) => c.categoryTag),
      clusters,
    };
  }

  async getProjectById(id: string): Promise<FeaturedProject | null> {
    const records = await this.client
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, id))
      .limit(1);
    if (!records[0]) return null;
    const media = await this.client
      .select()
      .from(projectMediaTable)
      .where(eq(projectMediaTable.projectId, id))
      .orderBy(asc(projectMediaTable.sortOrder));
    return mapProject(records[0], media);
  }

  async getProjectDetailById(id: string): Promise<ProjectDetail | null> {
    const records = await this.client
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, id))
      .limit(1);
    if (!records[0]) return null;

    const [mediaRows, comparisonRows] = await Promise.all([
      this.client
        .select()
        .from(projectMediaTable)
        .where(eq(projectMediaTable.projectId, id))
        .orderBy(asc(projectMediaTable.sortOrder)),
      this.client
        .select()
        .from(projectComparisonsTable)
        .where(eq(projectComparisonsTable.projectId, id))
        .orderBy(asc(projectComparisonsTable.sortOrder)),
    ]);

    const mediaUrlMap = new Map(mediaRows.map((m) => [m.id, m.publicUrl]));
    const comparisonPairs: ProjectComparisonPair[] = comparisonRows.map((c) => ({
      id: c.id,
      projectId: c.projectId,
      label: c.label,
      title: c.label,
      renderMediaId: c.renderMediaId,
      actualMediaId: c.actualMediaId,
      aspectRatio: c.aspectRatio,
      sortOrder: c.sortOrder,
      renderUrl: mediaUrlMap.get(c.renderMediaId),
      actualUrl: mediaUrlMap.get(c.actualMediaId),
    }));

    return {
      ...mapProject(records[0], mediaRows),
      media: mediaRows.map(mapMediaRecord),
      comparisonPairs,
    };
  }

  async createProject(
    data: Omit<FeaturedProject, "id"> & { id?: string }
  ): Promise<FeaturedProject> {
    const existing = await this.client
      .select({ id: projectsTable.id })
      .from(projectsTable)
      .where(eq(projectsTable.code, data.code))
      .limit(1);
    if (existing[0]) {
      const err = new Error(`Project code '${data.code}' already exists`);
      (err as Error & { statusCode?: number }).statusCode = 409;
      throw err;
    }

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
      segment: data.segment ?? "B2B",
      stage: data.stage ?? "COMPLETED",
      keyAccountId: data.keyAccountId ?? null,
      teamAndTimeline: data.teamAndTimeline ?? null,
      createdAt: now,
      updatedAt: now,
    });

    if (data.gallery && data.gallery.length > 0) {
      for (let i = 0; i < data.gallery.length; i++) {
        const g = data.gallery[i];
        await this.client.insert(projectMediaTable).values({
          id: g.id || generateUuidV7(),
          projectId: id,
          mediaType: "ACTUAL",
          publicUrl: g.src,
          caption: g.caption,
          location: g.location,
          spec: g.spec,
          aspectRatio: g.aspect,
          sortOrder: i,
          createdAt: now,
        });
      }
    }
    return (await this.getProjectById(id))!;
  }

  async updateProject(
    id: string,
    data: Partial<FeaturedProject>
  ): Promise<FeaturedProject | null> {
    const current = await this.getProjectById(id);
    if (!current) return null;

    if (data.code && data.code !== current.code) {
      const dup = await this.client
        .select({ id: projectsTable.id })
        .from(projectsTable)
        .where(eq(projectsTable.code, data.code))
        .limit(1);
      if (dup[0] && dup[0].id !== id) {
        const err = new Error(`Project code '${data.code}' already exists`);
        (err as Error & { statusCode?: number }).statusCode = 409;
        throw err;
      }
    }

    const now = new Date().toISOString();
    await this.client
      .update(projectsTable)
      .set({
        ...(data.code !== undefined && { code: data.code }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.subtitle !== undefined && { subtitle: data.subtitle }),
        ...(data.client !== undefined && { client: data.client }),
        ...(data.locations !== undefined && { locations: data.locations }),
        ...(data.year !== undefined && { year: parseYear(data.year) }),
        ...(data.categoryTag !== undefined && { categoryTag: data.categoryTag }),
        ...(data.scaleMetric !== undefined && { scaleMetric: data.scaleMetric }),
        ...(data.materials !== undefined && { materials: data.materials }),
        ...(data.engineeringNotes !== undefined && {
          engineeringNotes: data.engineeringNotes,
        }),
        ...(data.summary !== undefined && { summary: data.summary }),
        ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
        ...(data.segment !== undefined && { segment: data.segment }),
        ...(data.stage !== undefined && { stage: data.stage }),
        ...(data.keyAccountId !== undefined && {
          keyAccountId: data.keyAccountId,
        }),
        ...(data.teamAndTimeline !== undefined && {
          teamAndTimeline: data.teamAndTimeline,
        }),
        updatedAt: now,
      })
      .where(eq(projectsTable.id, id));

    return await this.getProjectById(id);
  }

  async deleteProject(id: string): Promise<boolean> {
    const deleted = await this.client
      .delete(projectsTable)
      .where(eq(projectsTable.id, id))
      .returning({ id: projectsTable.id });
    return deleted.length > 0;
  }

  async getHeroSlides(): Promise<HeroSlide[]> {
    const heroPlacements = await this.getPlacements("HERO_SLIDE");
    if (heroPlacements.length > 0) {
      const ids = heroPlacements.map((pl) => pl.projectId);
      const rows = await this.client
        .select()
        .from(projectsTable)
        .where(inArray(projectsTable.id, ids));
      const rowMap = new Map(rows.map((r) => [r.id, r]));

      return heroPlacements.map((pl) => {
        const meta = (pl.customMeta ?? {}) as Record<string, string>;
        const proj = rowMap.get(pl.projectId);
        return {
          id: meta.slideId ?? pl.id,
          image: meta.overrideImage ?? meta.image ?? proj?.coverImage ?? "",
          tag: meta.tag ?? proj?.categoryTag ?? "",
          title: meta.overrideTitle ?? meta.title ?? proj?.title ?? "",
          location: meta.location ?? proj?.locations[0] ?? "",
          specs: meta.specs ?? proj?.scaleMetric ?? "",
          lightingMode: meta.lightingMode ?? "Architectural Daylight",
        };
      });
    }

    const row = await this.client
      .select()
      .from(cmsMetadataTable)
      .where(eq(cmsMetadataTable.key, "hero_slides"))
      .limit(1);
    return row[0] ? JSON.parse(row[0].valueJson) : initialLandingContent.heroSlides;
  }

  async updateHeroSlides(slides: HeroSlide[]): Promise<HeroSlide[]> {
    const now = new Date().toISOString();
    await this.client
      .insert(cmsMetadataTable)
      .values({ key: "hero_slides", valueJson: JSON.stringify(slides), updatedAt: now })
      .onConflictDoUpdate({
        target: cmsMetadataTable.key,
        set: { valueJson: JSON.stringify(slides), updatedAt: now },
      });
    return slides;
  }

  async getLegalInfo(): Promise<CompanyLegalInfo> {
    const row = await this.client
      .select()
      .from(cmsMetadataTable)
      .where(eq(cmsMetadataTable.key, "legal_info"))
      .limit(1);
    return row[0]
      ? JSON.parse(row[0].valueJson)
      : initialLandingContent.companyLegalInfo;
  }

  async updateLegalInfo(
    info: Partial<CompanyLegalInfo>
  ): Promise<CompanyLegalInfo> {
    const current = await this.getLegalInfo();
    const updated = { ...current, ...info };
    const now = new Date().toISOString();
    await this.client
      .insert(cmsMetadataTable)
      .values({
        key: "legal_info",
        valueJson: JSON.stringify(updated),
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: cmsMetadataTable.key,
        set: { valueJson: JSON.stringify(updated), updatedAt: now },
      });
    return updated;
  }

  async getPlacements(
    slotType?: LandingPlacementSlot
  ): Promise<LandingPlacement[]> {
    const rows = slotType
      ? await this.client
          .select()
          .from(landingPlacementsTable)
          .where(eq(landingPlacementsTable.slotType, slotType))
          .orderBy(asc(landingPlacementsTable.sortOrder))
      : await this.client
          .select()
          .from(landingPlacementsTable)
          .orderBy(asc(landingPlacementsTable.sortOrder));

    return rows.map((r) => ({
      id: r.id,
      slotType: r.slotType,
      projectId: r.projectId,
      sortOrder: r.sortOrder,
      customMeta: (r.customMeta ?? null) as Record<string, unknown> | null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  async upsertPlacement(
    input: UpsertLandingPlacement
  ): Promise<LandingPlacement> {
    const proj = await this.client
      .select({ id: projectsTable.id })
      .from(projectsTable)
      .where(eq(projectsTable.id, input.projectId))
      .limit(1);
    if (!proj[0]) {
      const err = new Error(
        `Project with id '${input.projectId}' does not exist`
      );
      (err as Error & { statusCode?: number }).statusCode = 400;
      throw err;
    }

    const id = input.id || generateUuidV7();
    const now = new Date().toISOString();
    const customMeta = (input.customMeta ?? null) as LandingPlacementMeta | null;

    await this.client
      .insert(landingPlacementsTable)
      .values({
        id,
        slotType: input.slotType,
        projectId: input.projectId,
        sortOrder: input.sortOrder,
        customMeta,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: landingPlacementsTable.id,
        set: {
          slotType: input.slotType,
          projectId: input.projectId,
          sortOrder: input.sortOrder,
          customMeta,
          updatedAt: now,
        },
      });

    return {
      id,
      slotType: input.slotType,
      projectId: input.projectId,
      sortOrder: input.sortOrder,
      customMeta: input.customMeta ?? null,
      createdAt: now,
      updatedAt: now,
    };
  }

  async deletePlacement(id: string): Promise<boolean> {
    const deleted = await this.client
      .delete(landingPlacementsTable)
      .where(eq(landingPlacementsTable.id, id))
      .returning({ id: landingPlacementsTable.id });
    return deleted.length > 0;
  }

  async getGalleryClusters(): Promise<GalleryClusterConfig[] | undefined> {
    const row = await this.client
      .select()
      .from(cmsMetadataTable)
      .where(eq(cmsMetadataTable.key, "gallery_clusters"))
      .limit(1);
    return row[0] ? (JSON.parse(row[0].valueJson) as GalleryClusterConfig[]) : undefined;
  }

  async updateGalleryClusters(
    clusters: GalleryClusterConfig[]
  ): Promise<GalleryClusterConfig[]> {
    const now = new Date().toISOString();
    await this.client
      .insert(cmsMetadataTable)
      .values({
        key: "gallery_clusters",
        valueJson: JSON.stringify(clusters),
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: cmsMetadataTable.key,
        set: { valueJson: JSON.stringify(clusters), updatedAt: now },
      });
    return clusters;
  }
}
