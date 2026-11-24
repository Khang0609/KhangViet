import { asc, desc, eq, inArray } from "drizzle-orm";
import type {
  CompanyLegalInfo,
  CoreDiscipline,
  CreateOrganizationDto,
  CreateProjectDto,
  CreateProjectMediaDto,
  GalleryClusterConfig,
  GalleryProject,
  HeroSlide,
  LandingContent,
  Organization,
  ProductionDivision,
  Project,
  ProjectComparison,
  ProjectGalleryResponse,
  ProjectMedia,
  Service,
  SiteSettingKey,
  UpdateOrganizationDto,
  UpdateProjectDto,
} from "@khangviet/types";
import type {
  GalleryQueryOptions,
  ICmsRepository,
  ProjectQueryOptions,
} from "../../interfaces/ICmsRepository";
import { slugify } from "../../utils/slugify";
import type { D1Client } from "../client";
import {
  organizationsTable,
  projectComparisonsTable,
  projectMediaTable,
  projectServicesTable,
  projectsTable,
  servicesTable,
  siteSettingsTable,
  type OrganizationRecord,
  type ProjectRecord,
} from "../schema";
import { generateUuidV7 } from "../uuid-v7";

const DEFAULT_LEGAL_INFO: CompanyLegalInfo = {
  fullName: "CÔNG TY TNHH THIẾT KẾ VÀ XÂY DỰNG KHANG VIỆT",
  shortName: "Khang Việt Design",
  establishedYear: 2016,
  taxId: "",
  licenseIssuer: "",
  licenseDate: "",
  director: "",
  directorTitle: "Giám đốc",
  factoryAddress: "",
  hotline: "",
  hotlineFormatted: "",
  email: "",
  commitment: "",
};

function mapOrganization(row: OrganizationRecord): Organization {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? null,
    logoKey: row.logoKey ?? null,
    isFeatured: row.isFeatured === 1,
    featuredOrder: row.featuredOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class D1CmsRepository implements ICmsRepository {
  constructor(private readonly db: D1Client) {}

  private async hydrateProjects(rows: ProjectRecord[]): Promise<Project[]> {
    if (rows.length === 0) return [];
    const projectIds = rows.map((r) => r.id);

    const [orgRows, serviceRows, psRows, mediaRows, compRows] =
      await Promise.all([
        this.db.select().from(organizationsTable),
        this.db
          .select()
          .from(servicesTable)
          .orderBy(asc(servicesTable.sortOrder)),
        this.db
          .select()
          .from(projectServicesTable)
          .where(inArray(projectServicesTable.projectId, projectIds)),
        this.db
          .select()
          .from(projectMediaTable)
          .where(inArray(projectMediaTable.projectId, projectIds))
          .orderBy(asc(projectMediaTable.sortOrder)),
        this.db
          .select()
          .from(projectComparisonsTable)
          .where(inArray(projectComparisonsTable.projectId, projectIds)),
      ]);

    const orgMap = new Map(orgRows.map((o) => [o.id, mapOrganization(o)]));
    const serviceMap = new Map<string, Service>(
      serviceRows.map((s) => [s.id, s])
    );

    return rows.map((row) => {
      const services = psRows
        .filter((ps) => ps.projectId === row.id)
        .map((ps) => serviceMap.get(ps.serviceId))
        .filter((s): s is Service => Boolean(s));

      const media: ProjectMedia[] = mediaRows
        .filter((m) => m.projectId === row.id)
        .map((m) => ({
          id: m.id,
          projectId: m.projectId,
          kind: m.kind,
          storageKey: m.storageKey,
          altText: m.altText ?? null,
          caption: m.caption ?? null,
          sortOrder: m.sortOrder,
          isCover: m.isCover === 1,
          createdAt: m.createdAt,
        }));

      const comparisons: ProjectComparison[] = compRows
        .filter((c) => c.projectId === row.id)
        .map((c) => ({
          id: c.id,
          projectId: c.projectId,
          renderMediaId: c.renderMediaId,
          actualMediaId: c.actualMediaId,
        }));

      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        summary: row.summary ?? null,
        organizationId: row.organizationId ?? null,
        year: row.year ?? null,
        publishStatus: row.publishStatus,
        isFeatured: row.isFeatured === 1,
        featuredOrder: row.featuredOrder,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        organization: row.organizationId
          ? orgMap.get(row.organizationId) ?? null
          : null,
        services,
        media,
        comparisons,
      };
    });
  }

  async getLandingData(): Promise<LandingContent> {
    const [
      heroSlides,
      coreDisciplines,
      productionDivisions,
      companyLegalInfo,
      allOrgs,
      featuredRows,
    ] = await Promise.all([
      this.getHeroSlides(),
      this.getSiteSetting<CoreDiscipline[]>("core_disciplines"),
      this.getSiteSetting<ProductionDivision[]>("production_divisions"),
      this.getLegalInfo(),
      this.getOrganizations(),
      this.db
        .select()
        .from(projectsTable)
        .where(eq(projectsTable.publishStatus, "PUBLISHED"))
        .orderBy(
          desc(projectsTable.isFeatured),
          asc(projectsTable.featuredOrder),
          desc(projectsTable.createdAt)
        ),
    ]);

    const featuredProjects = await this.hydrateProjects(
      featuredRows.filter((p) => p.isFeatured === 1)
    );

    return {
      heroSlides,
      featuredOrganizations: allOrgs.filter((o) => o.isFeatured),
      coreDisciplines: coreDisciplines ?? [],
      featuredProjects,
      productionDivisions: productionDivisions ?? [],
      companyLegalInfo,
    };
  }

  async getGalleryData(
    options?: GalleryQueryOptions
  ): Promise<ProjectGalleryResponse> {
    const [clusters, services, organizations, allProjects] = await Promise.all([
      this.getGalleryClusters(),
      this.getServices(),
      this.getOrganizations(),
      this.getProjects({ includeDrafts: false, search: options?.search }),
    ]);

    const filtered = allProjects.filter((p) => {
      if (
        options?.serviceSlug &&
        !p.services?.some((s) => s.slug === options.serviceSlug)
      ) {
        return false;
      }
      if (
        options?.organizationSlug &&
        p.organization?.slug !== options.organizationSlug
      ) {
        return false;
      }
      return true;
    });

    const projects: GalleryProject[] = filtered.map((p) => {
      const media = p.media ?? [];
      const coverMedia =
        media.find((m) => m.isCover) ?? media[0] ?? null;
      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        summary: p.summary ?? null,
        year: p.year ?? null,
        publishStatus: p.publishStatus,
        isFeatured: p.isFeatured,
        featuredOrder: p.featuredOrder,
        organization: p.organization ?? null,
        services: p.services ?? [],
        coverMedia,
        media,
        comparisons: p.comparisons ?? [],
      };
    });

    return { clusters, services, organizations, projects };
  }

  async getProjects(options?: ProjectQueryOptions): Promise<Project[]> {
    const rows = options?.includeDrafts
      ? await this.db
          .select()
          .from(projectsTable)
          .orderBy(asc(projectsTable.featuredOrder), desc(projectsTable.createdAt))
      : await this.db
          .select()
          .from(projectsTable)
          .where(eq(projectsTable.publishStatus, "PUBLISHED"))
          .orderBy(asc(projectsTable.featuredOrder), desc(projectsTable.createdAt));

    let hydrated = await this.hydrateProjects(rows);

    if (options?.organizationId) {
      hydrated = hydrated.filter(
        (p) => p.organizationId === options.organizationId
      );
    }
    if (options?.serviceId) {
      hydrated = hydrated.filter((p) =>
        p.services?.some((s) => s.id === options.serviceId)
      );
    }
    if (options?.search?.trim()) {
      const term = options.search.trim().toLowerCase();
      hydrated = hydrated.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.slug.toLowerCase().includes(term) ||
          (p.organization?.name.toLowerCase().includes(term) ?? false)
      );
    }

    return hydrated;
  }

  async getProjectById(id: string): Promise<Project | null> {
    const rows = await this.db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, id))
      .limit(1);
    if (!rows[0]) return null;
    const hydrated = await this.hydrateProjects([rows[0]]);
    return hydrated[0] ?? null;
  }

  async getProjectBySlug(
    slug: string,
    includeDrafts = false
  ): Promise<Project | null> {
    const rows = await this.db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.slug, slug))
      .limit(1);
    if (!rows[0]) return null;
    if (!includeDrafts && rows[0].publishStatus !== "PUBLISHED") return null;
    const hydrated = await this.hydrateProjects([rows[0]]);
    return hydrated[0] ?? null;
  }

  async createProject(input: CreateProjectDto): Promise<Project> {
    const now = Math.floor(Date.now() / 1000);
    const id = generateUuidV7();
    const slug = input.slug?.trim() || `${slugify(input.title)}-${id.slice(-4)}`;

    await this.db.insert(projectsTable).values({
      id,
      slug,
      title: input.title.trim(),
      summary: input.summary?.trim() || null,
      organizationId: input.organizationId ?? null,
      year: input.year ?? null,
      publishStatus: input.publishStatus,
      isFeatured: input.isFeatured ? 1 : 0,
      featuredOrder: input.featuredOrder,
      createdAt: now,
      updatedAt: now,
    });

    if (input.serviceIds.length > 0) {
      await this.db.insert(projectServicesTable).values(
        input.serviceIds.map((serviceId) => ({
          projectId: id,
          serviceId,
        }))
      );
    }

    const created = await this.getProjectById(id);
    if (!created) throw new Error("Failed to load created project");
    return created;
  }

  async updateProject(
    id: string,
    input: UpdateProjectDto
  ): Promise<Project | null> {
    const existing = await this.db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, id))
      .limit(1);
    if (!existing[0]) return null;

    const now = Math.floor(Date.now() / 1000);
    await this.db
      .update(projectsTable)
      .set({
        ...(input.slug !== undefined ? { slug: input.slug.trim() } : {}),
        ...(input.title !== undefined ? { title: input.title.trim() } : {}),
        ...(input.summary !== undefined
          ? { summary: input.summary?.trim() || null }
          : {}),
        ...(input.organizationId !== undefined
          ? { organizationId: input.organizationId }
          : {}),
        ...(input.year !== undefined ? { year: input.year } : {}),
        ...(input.publishStatus !== undefined
          ? { publishStatus: input.publishStatus }
          : {}),
        ...(input.isFeatured !== undefined
          ? { isFeatured: input.isFeatured ? 1 : 0 }
          : {}),
        ...(input.featuredOrder !== undefined
          ? { featuredOrder: input.featuredOrder }
          : {}),
        updatedAt: now,
      })
      .where(eq(projectsTable.id, id));

    if (input.serviceIds !== undefined) {
      await this.db
        .delete(projectServicesTable)
        .where(eq(projectServicesTable.projectId, id));
      if (input.serviceIds.length > 0) {
        await this.db.insert(projectServicesTable).values(
          input.serviceIds.map((serviceId) => ({
            projectId: id,
            serviceId,
          }))
        );
      }
    }

    return await this.getProjectById(id);
  }

  async deleteProject(id: string): Promise<boolean> {
    const existing = await this.db
      .select({ id: projectsTable.id })
      .from(projectsTable)
      .where(eq(projectsTable.id, id))
      .limit(1);
    if (!existing[0]) return false;
    await this.db.delete(projectsTable).where(eq(projectsTable.id, id));
    return true;
  }

  async addProjectMedia(
    projectId: string,
    input: CreateProjectMediaDto
  ): Promise<ProjectMedia> {
    const now = Math.floor(Date.now() / 1000);
    const id = generateUuidV7();

    if (input.isCover) {
      await this.db
        .update(projectMediaTable)
        .set({ isCover: 0 })
        .where(eq(projectMediaTable.projectId, projectId));
    }

    await this.db.insert(projectMediaTable).values({
      id,
      projectId,
      kind: input.kind,
      storageKey: input.storageKey,
      altText: input.altText ?? null,
      caption: input.caption ?? null,
      sortOrder: input.sortOrder,
      isCover: input.isCover ? 1 : 0,
      createdAt: now,
    });

    return {
      id,
      projectId,
      kind: input.kind,
      storageKey: input.storageKey,
      altText: input.altText ?? null,
      caption: input.caption ?? null,
      sortOrder: input.sortOrder,
      isCover: input.isCover,
      createdAt: now,
    };
  }

  async deleteProjectMedia(mediaId: string): Promise<boolean> {
    const existing = await this.db
      .select({ id: projectMediaTable.id })
      .from(projectMediaTable)
      .where(eq(projectMediaTable.id, mediaId))
      .limit(1);
    if (!existing[0]) return false;
    await this.db
      .delete(projectMediaTable)
      .where(eq(projectMediaTable.id, mediaId));
    return true;
  }

  async setProjectComparison(
    projectId: string,
    renderMediaId: string,
    actualMediaId: string
  ): Promise<ProjectComparison> {
    const id = generateUuidV7();
    await this.db
      .delete(projectComparisonsTable)
      .where(eq(projectComparisonsTable.projectId, projectId));
    await this.db.insert(projectComparisonsTable).values({
      id,
      projectId,
      renderMediaId,
      actualMediaId,
    });
    return { id, projectId, renderMediaId, actualMediaId };
  }

  async getOrganizations(): Promise<Organization[]> {
    const rows = await this.db
      .select()
      .from(organizationsTable)
      .orderBy(
        desc(organizationsTable.isFeatured),
        asc(organizationsTable.featuredOrder),
        asc(organizationsTable.name)
      );
    return rows.map(mapOrganization);
  }

  async getOrganizationById(id: string): Promise<Organization | null> {
    const rows = await this.db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, id))
      .limit(1);
    return rows[0] ? mapOrganization(rows[0]) : null;
  }

  async createOrganization(
    input: CreateOrganizationDto
  ): Promise<Organization> {
    const now = Math.floor(Date.now() / 1000);
    const id = generateUuidV7();
    const slug = input.slug?.trim() || `${slugify(input.name)}-${id.slice(-4)}`;

    const record = {
      id,
      name: input.name.trim(),
      slug,
      description: input.description?.trim() || null,
      logoKey: input.logoKey?.trim() || null,
      isFeatured: input.isFeatured ? 1 : 0,
      featuredOrder: input.featuredOrder,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.insert(organizationsTable).values(record);
    return mapOrganization(record);
  }

  async updateOrganization(
    id: string,
    input: UpdateOrganizationDto
  ): Promise<Organization | null> {
    const existing = await this.db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, id))
      .limit(1);
    if (!existing[0]) return null;

    const now = Math.floor(Date.now() / 1000);
    await this.db
      .update(organizationsTable)
      .set({
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.slug !== undefined ? { slug: input.slug.trim() } : {}),
        ...(input.description !== undefined
          ? { description: input.description?.trim() || null }
          : {}),
        ...(input.logoKey !== undefined
          ? { logoKey: input.logoKey?.trim() || null }
          : {}),
        ...(input.isFeatured !== undefined
          ? { isFeatured: input.isFeatured ? 1 : 0 }
          : {}),
        ...(input.featuredOrder !== undefined
          ? { featuredOrder: input.featuredOrder }
          : {}),
        updatedAt: now,
      })
      .where(eq(organizationsTable.id, id));

    return await this.getOrganizationById(id);
  }

  async deleteOrganization(id: string): Promise<boolean> {
    const existing = await this.db
      .select({ id: organizationsTable.id })
      .from(organizationsTable)
      .where(eq(organizationsTable.id, id))
      .limit(1);
    if (!existing[0]) return false;
    await this.db
      .delete(organizationsTable)
      .where(eq(organizationsTable.id, id));
    return true;
  }

  async getServices(): Promise<Service[]> {
    return await this.db
      .select()
      .from(servicesTable)
      .orderBy(asc(servicesTable.sortOrder));
  }

  async getSiteSetting<T>(key: SiteSettingKey): Promise<T | null> {
    const rows = await this.db
      .select()
      .from(siteSettingsTable)
      .where(eq(siteSettingsTable.key, key))
      .limit(1);
    if (!rows[0]) return null;
    try {
      return JSON.parse(rows[0].valueJson) as T;
    } catch {
      return null;
    }
  }

  async upsertSiteSetting<T>(key: SiteSettingKey, value: T): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    const valueJson = JSON.stringify(value);
    const existing = await this.db
      .select({ key: siteSettingsTable.key })
      .from(siteSettingsTable)
      .where(eq(siteSettingsTable.key, key))
      .limit(1);

    if (existing[0]) {
      await this.db
        .update(siteSettingsTable)
        .set({ valueJson, updatedAt: now })
        .where(eq(siteSettingsTable.key, key));
    } else {
      await this.db.insert(siteSettingsTable).values({
        key,
        valueJson,
        updatedAt: now,
      });
    }
  }

  async getHeroSlides(): Promise<HeroSlide[]> {
    return (await this.getSiteSetting<HeroSlide[]>("hero_slides")) ?? [];
  }

  async updateHeroSlides(slides: HeroSlide[]): Promise<HeroSlide[]> {
    await this.upsertSiteSetting("hero_slides", slides);
    return slides;
  }

  async getLegalInfo(): Promise<CompanyLegalInfo> {
    return (
      (await this.getSiteSetting<CompanyLegalInfo>("company_legal_info")) ??
      DEFAULT_LEGAL_INFO
    );
  }

  async updateLegalInfo(
    info: Partial<CompanyLegalInfo>
  ): Promise<CompanyLegalInfo> {
    const current = await this.getLegalInfo();
    const merged: CompanyLegalInfo = { ...current, ...info };
    await this.upsertSiteSetting("company_legal_info", merged);
    return merged;
  }

  async getGalleryClusters(): Promise<GalleryClusterConfig[]> {
    return (
      (await this.getSiteSetting<GalleryClusterConfig[]>("gallery_clusters")) ??
      []
    );
  }

  async updateGalleryClusters(
    clusters: GalleryClusterConfig[]
  ): Promise<GalleryClusterConfig[]> {
    await this.upsertSiteSetting("gallery_clusters", clusters);
    return clusters;
  }
}
