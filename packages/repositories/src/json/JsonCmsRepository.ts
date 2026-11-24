import type {
  CompanyLegalInfo,
  CreateOrganizationDto,
  CreateProjectDto,
  CreateProjectMediaDto,
  GalleryClusterConfig,
  GalleryProject,
  HeroSlide,
  LandingContent,
  Organization,
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
} from "../interfaces/ICmsRepository";
import { generateUuidV7 } from "../d1/uuid-v7";
import { slugify } from "../utils/slugify";
import { getStore } from "./store";

export class JsonCmsRepository implements ICmsRepository {
  private hydrateProject(p: Project): Project {
    const store = getStore();
    const organization = p.organizationId
      ? store.organizations.find((o) => o.id === p.organizationId) ?? null
      : null;
    const serviceIds = store.projectServices
      .filter((ps) => ps.projectId === p.id)
      .map((ps) => ps.serviceId);
    const services = store.services
      .filter((s) => serviceIds.includes(s.id))
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const media = store.projectMedia
      .filter((m) => m.projectId === p.id)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const comparisons = store.projectComparisons.filter(
      (c) => c.projectId === p.id
    );

    return {
      ...p,
      organization,
      services,
      media,
      comparisons,
    };
  }

  async getLandingData(): Promise<LandingContent> {
    const store = getStore();
    const featuredProjects = store.projects
      .filter((p) => p.publishStatus === "PUBLISHED" && p.isFeatured)
      .sort((a, b) => a.featuredOrder - b.featuredOrder)
      .map((p) => this.hydrateProject(p));

    const featuredOrganizations = store.organizations
      .filter((o) => o.isFeatured)
      .sort((a, b) => a.featuredOrder - b.featuredOrder);

    return {
      heroSlides: [...store.heroSlides],
      featuredOrganizations,
      coreDisciplines: [...store.coreDisciplines],
      featuredProjects,
      productionDivisions: [...store.productionDivisions],
      companyLegalInfo: { ...store.companyLegalInfo },
    };
  }

  async getGalleryData(
    options?: GalleryQueryOptions
  ): Promise<ProjectGalleryResponse> {
    const store = getStore();
    const allProjects = await this.getProjects({
      includeDrafts: false,
      search: options?.search,
    });

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
      const coverMedia = media.find((m) => m.isCover) ?? media[0] ?? null;
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

    return {
      clusters: [...store.galleryClusters].sort(
        (a, b) => a.sortOrder - b.sortOrder
      ),
      services: [...store.services].sort((a, b) => a.sortOrder - b.sortOrder),
      organizations: await this.getOrganizations(),
      projects,
    };
  }

  async getProjects(options?: ProjectQueryOptions): Promise<Project[]> {
    const store = getStore();
    let list = store.projects
      .filter((p) =>
        options?.includeDrafts ? true : p.publishStatus === "PUBLISHED"
      )
      .map((p) => this.hydrateProject(p));

    if (options?.organizationId) {
      list = list.filter((p) => p.organizationId === options.organizationId);
    }
    if (options?.serviceId) {
      list = list.filter((p) =>
        p.services?.some((s) => s.id === options.serviceId)
      );
    }
    if (options?.search?.trim()) {
      const term = options.search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.slug.toLowerCase().includes(term) ||
          (p.organization?.name.toLowerCase().includes(term) ?? false)
      );
    }

    return list.sort((a, b) => a.featuredOrder - b.featuredOrder);
  }

  async getProjectById(id: string): Promise<Project | null> {
    const p = getStore().projects.find((item) => item.id === id);
    return p ? this.hydrateProject(p) : null;
  }

  async getProjectBySlug(
    slug: string,
    includeDrafts = false
  ): Promise<Project | null> {
    const p = getStore().projects.find((item) => item.slug === slug);
    if (!p) return null;
    if (!includeDrafts && p.publishStatus !== "PUBLISHED") return null;
    return this.hydrateProject(p);
  }

  async createProject(input: CreateProjectDto): Promise<Project> {
    const store = getStore();
    const now = Math.floor(Date.now() / 1000);
    const id = generateUuidV7();
    const slug = input.slug?.trim() || `${slugify(input.title)}-${id.slice(-4)}`;

    if (store.projects.some((p) => p.slug === slug)) {
      throw new Error(`UNIQUE constraint failed: projects.slug (${slug})`);
    }

    const project: Project = {
      id,
      slug,
      title: input.title.trim(),
      summary: input.summary?.trim() || null,
      organizationId: input.organizationId ?? null,
      year: input.year ?? null,
      publishStatus: input.publishStatus,
      isFeatured: input.isFeatured,
      featuredOrder: input.featuredOrder,
      createdAt: now,
      updatedAt: now,
    };

    store.projects.unshift(project);
    for (const serviceId of input.serviceIds) {
      store.projectServices.push({ projectId: id, serviceId });
    }

    return this.hydrateProject(project);
  }

  async updateProject(
    id: string,
    input: UpdateProjectDto
  ): Promise<Project | null> {
    const store = getStore();
    const idx = store.projects.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    if (
      input.slug !== undefined &&
      store.projects.some((p) => p.id !== id && p.slug === input.slug?.trim())
    ) {
      throw new Error(
        `UNIQUE constraint failed: projects.slug (${input.slug})`
      );
    }

    const existing = store.projects[idx];
    const updated: Project = {
      ...existing,
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
        ? { isFeatured: input.isFeatured }
        : {}),
      ...(input.featuredOrder !== undefined
        ? { featuredOrder: input.featuredOrder }
        : {}),
      updatedAt: Math.floor(Date.now() / 1000),
    };

    store.projects[idx] = updated;

    if (input.serviceIds !== undefined) {
      store.projectServices = store.projectServices.filter(
        (ps) => ps.projectId !== id
      );
      for (const serviceId of input.serviceIds) {
        store.projectServices.push({ projectId: id, serviceId });
      }
    }

    return this.hydrateProject(updated);
  }

  async deleteProject(id: string): Promise<boolean> {
    const store = getStore();
    const idx = store.projects.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    store.projects.splice(idx, 1);
    store.projectServices = store.projectServices.filter(
      (ps) => ps.projectId !== id
    );
    store.projectMedia = store.projectMedia.filter((m) => m.projectId !== id);
    store.projectComparisons = store.projectComparisons.filter(
      (c) => c.projectId !== id
    );
    return true;
  }

  async addProjectMedia(
    projectId: string,
    input: CreateProjectMediaDto
  ): Promise<ProjectMedia> {
    const store = getStore();
    if (input.isCover) {
      store.projectMedia = store.projectMedia.map((m) =>
        m.projectId === projectId ? { ...m, isCover: false } : m
      );
    }

    const media: ProjectMedia = {
      id: generateUuidV7(),
      projectId,
      kind: input.kind,
      storageKey: input.storageKey,
      altText: input.altText ?? null,
      caption: input.caption ?? null,
      sortOrder: input.sortOrder,
      isCover: input.isCover,
      createdAt: Math.floor(Date.now() / 1000),
    };
    store.projectMedia.push(media);
    return media;
  }

  async deleteProjectMedia(mediaId: string): Promise<boolean> {
    const store = getStore();
    const idx = store.projectMedia.findIndex((m) => m.id === mediaId);
    if (idx === -1) return false;
    store.projectMedia.splice(idx, 1);
    store.projectComparisons = store.projectComparisons.filter(
      (c) => c.renderMediaId !== mediaId && c.actualMediaId !== mediaId
    );
    return true;
  }

  async setProjectComparison(
    projectId: string,
    renderMediaId: string,
    actualMediaId: string
  ): Promise<ProjectComparison> {
    const store = getStore();
    store.projectComparisons = store.projectComparisons.filter(
      (c) => c.projectId !== projectId
    );
    const comparison: ProjectComparison = {
      id: generateUuidV7(),
      projectId,
      renderMediaId,
      actualMediaId,
    };
    store.projectComparisons.push(comparison);
    return comparison;
  }

  async getOrganizations(): Promise<Organization[]> {
    return [...getStore().organizations].sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      if (a.featuredOrder !== b.featuredOrder) {
        return a.featuredOrder - b.featuredOrder;
      }
      return a.name.localeCompare(b.name);
    });
  }

  async getOrganizationById(id: string): Promise<Organization | null> {
    return getStore().organizations.find((o) => o.id === id) ?? null;
  }

  async createOrganization(
    input: CreateOrganizationDto
  ): Promise<Organization> {
    const store = getStore();
    const now = Math.floor(Date.now() / 1000);
    const id = generateUuidV7();
    const slug = input.slug?.trim() || `${slugify(input.name)}-${id.slice(-4)}`;

    if (store.organizations.some((o) => o.slug === slug)) {
      throw new Error(`UNIQUE constraint failed: organizations.slug (${slug})`);
    }

    const org: Organization = {
      id,
      name: input.name.trim(),
      slug,
      description: input.description?.trim() || null,
      logoKey: input.logoKey?.trim() || null,
      isFeatured: input.isFeatured,
      featuredOrder: input.featuredOrder,
      createdAt: now,
      updatedAt: now,
    };
    store.organizations.push(org);
    return org;
  }

  async updateOrganization(
    id: string,
    input: UpdateOrganizationDto
  ): Promise<Organization | null> {
    const store = getStore();
    const idx = store.organizations.findIndex((o) => o.id === id);
    if (idx === -1) return null;

    if (
      input.slug !== undefined &&
      store.organizations.some(
        (o) => o.id !== id && o.slug === input.slug?.trim()
      )
    ) {
      throw new Error(
        `UNIQUE constraint failed: organizations.slug (${input.slug})`
      );
    }

    const updated: Organization = {
      ...store.organizations[idx],
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.slug !== undefined ? { slug: input.slug.trim() } : {}),
      ...(input.description !== undefined
        ? { description: input.description?.trim() || null }
        : {}),
      ...(input.logoKey !== undefined
        ? { logoKey: input.logoKey?.trim() || null }
        : {}),
      ...(input.isFeatured !== undefined
        ? { isFeatured: input.isFeatured }
        : {}),
      ...(input.featuredOrder !== undefined
        ? { featuredOrder: input.featuredOrder }
        : {}),
      updatedAt: Math.floor(Date.now() / 1000),
    };
    store.organizations[idx] = updated;
    return updated;
  }

  async deleteOrganization(id: string): Promise<boolean> {
    const store = getStore();
    const idx = store.organizations.findIndex((o) => o.id === id);
    if (idx === -1) return false;
    store.organizations.splice(idx, 1);
    store.projects = store.projects.map((p) =>
      p.organizationId === id ? { ...p, organizationId: null } : p
    );
    return true;
  }

  async getServices(): Promise<Service[]> {
    return [...getStore().services].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getSiteSetting<T>(key: SiteSettingKey): Promise<T | null> {
    const store = getStore();
    switch (key) {
      case "hero_slides":
        return store.heroSlides as unknown as T;
      case "core_disciplines":
        return store.coreDisciplines as unknown as T;
      case "production_divisions":
        return store.productionDivisions as unknown as T;
      case "company_legal_info":
        return store.companyLegalInfo as unknown as T;
      case "gallery_clusters":
        return store.galleryClusters as unknown as T;
      default:
        return null;
    }
  }

  async upsertSiteSetting<T>(key: SiteSettingKey, value: T): Promise<void> {
    const store = getStore();
    switch (key) {
      case "hero_slides":
        store.heroSlides = value as unknown as HeroSlide[];
        break;
      case "core_disciplines":
        store.coreDisciplines = value as unknown as typeof store.coreDisciplines;
        break;
      case "production_divisions":
        store.productionDivisions =
          value as unknown as typeof store.productionDivisions;
        break;
      case "company_legal_info":
        store.companyLegalInfo = value as unknown as CompanyLegalInfo;
        break;
      case "gallery_clusters":
        store.galleryClusters = value as unknown as GalleryClusterConfig[];
        break;
    }
  }

  async getHeroSlides(): Promise<HeroSlide[]> {
    return [...getStore().heroSlides];
  }

  async updateHeroSlides(slides: HeroSlide[]): Promise<HeroSlide[]> {
    getStore().heroSlides = slides;
    return slides;
  }

  async getLegalInfo(): Promise<CompanyLegalInfo> {
    return { ...getStore().companyLegalInfo };
  }

  async updateLegalInfo(
    info: Partial<CompanyLegalInfo>
  ): Promise<CompanyLegalInfo> {
    const store = getStore();
    store.companyLegalInfo = { ...store.companyLegalInfo, ...info };
    return store.companyLegalInfo;
  }

  async getGalleryClusters(): Promise<GalleryClusterConfig[]> {
    return [...getStore().galleryClusters].sort(
      (a, b) => a.sortOrder - b.sortOrder
    );
  }

  async updateGalleryClusters(
    clusters: GalleryClusterConfig[]
  ): Promise<GalleryClusterConfig[]> {
    getStore().galleryClusters = clusters;
    return clusters;
  }
}
