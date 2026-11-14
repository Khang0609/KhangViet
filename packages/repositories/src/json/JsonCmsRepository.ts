import type {
  LandingContent,
  FeaturedProject,
  ProjectDetail,
  ProjectListQuery,
  PaginationMeta,
  GalleryApiResponse,
  GalleryProject,
  HeroSlide,
  CompanyLegalInfo,
  LandingPlacement,
  LandingPlacementSlot,
  UpsertLandingPlacement,
  ProjectComparisonPair,
} from "@khangviet/types";
import { ICmsRepository } from "../interfaces/ICmsRepository";
import { mockStore } from "./store";

function paginate<T>(
  items: T[],
  page: number,
  limit: number
): { items: T[]; pagination: PaginationMeta } {
  const total = items.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  const start = (page - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    pagination: { page, limit, total, totalPages },
  };
}

function matchesSearch(
  fields: Array<string | undefined | null>,
  keyword?: string
): boolean {
  if (!keyword) return true;
  const q = keyword.trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) => f && f.toLowerCase().includes(q));
}

export class JsonCmsRepository implements ICmsRepository {
  async getLandingData(): Promise<LandingContent> {
    const heroSlides = await this.getHeroSlides();
    const featuredPlacements = await this.getPlacements("FEATURED_SHOWCASE");

    const projectMap = new Map(
      mockStore.landing.featuredProjects.map((p) => [p.id, p])
    );

    const featuredProjects =
      featuredPlacements.length > 0
        ? featuredPlacements
            .map((pl) => projectMap.get(pl.projectId))
            .filter((p): p is FeaturedProject => Boolean(p))
        : mockStore.landing.featuredProjects;

    return {
      ...mockStore.landing,
      heroSlides,
      featuredProjects,
    };
  }

  async getProjects(): Promise<FeaturedProject[]> {
    return mockStore.landing.featuredProjects;
  }

  async queryProjects(
    query: ProjectListQuery
  ): Promise<{ items: FeaturedProject[]; pagination: PaginationMeta }> {
    const filtered = mockStore.landing.featuredProjects.filter((p) => {
      if (query.segment && query.segment !== "ALL" && p.segment !== query.segment) {
        return false;
      }
      if (query.stage && query.stage !== "ALL" && p.stage !== query.stage) {
        return false;
      }
      if (
        query.categoryTag &&
        query.categoryTag !== "ALL" &&
        p.categoryTag.toLowerCase() !== query.categoryTag.toLowerCase()
      ) {
        return false;
      }
      if (
        query.keyAccount &&
        query.keyAccount !== "ALL" &&
        p.keyAccountId !== query.keyAccount
      ) {
        return false;
      }
      return matchesSearch(
        [p.title, p.subtitle, p.client, p.code, p.categoryTag, ...p.locations],
        query.search
      );
    });

    return paginate(filtered, query.page, query.limit);
  }

  async getGalleryData(query: ProjectListQuery): Promise<GalleryApiResponse> {
    const filtered = mockStore.galleryProjects.filter((p: GalleryProject) => {
      if (query.segment && query.segment !== "ALL" && p.segment !== query.segment) {
        return false;
      }
      if (query.stage && query.stage !== "ALL" && p.stage !== query.stage) {
        return false;
      }
      if (
        query.categoryTag &&
        query.categoryTag !== "ALL" &&
        p.category.toLowerCase() !== query.categoryTag.toLowerCase()
      ) {
        return false;
      }
      if (
        query.keyAccount &&
        query.keyAccount !== "ALL" &&
        p.keyAccount !== query.keyAccount
      ) {
        return false;
      }
      return matchesSearch(
        [p.title, p.client, p.code, p.category, p.location, p.material],
        query.search
      );
    });

    const { items, pagination } = paginate(filtered, query.page, query.limit);

    return {
      items,
      pagination,
      keyAccounts: mockStore.keyAccounts,
      categories: mockStore.galleryCategories,
      stats: mockStore.galleryStats,
    };
  }

  async getProjectById(id: string): Promise<FeaturedProject | null> {
    const project = mockStore.landing.featuredProjects.find((p) => p.id === id);
    return project ? { ...project } : null;
  }

  async getProjectDetailById(id: string): Promise<ProjectDetail | null> {
    const project = await this.getProjectById(id);
    if (!project) return null;

    const media = mockStore.projectMedia
      .filter((m) => m.projectId === id)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const mediaMap = new Map(media.map((m) => [m.id, m.publicUrl]));
    const comparisonPairs: ProjectComparisonPair[] = mockStore.projectComparisons
      .filter((c) => c.projectId === id)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c) => ({
        ...c,
        renderUrl: c.renderUrl ?? mediaMap.get(c.renderMediaId),
        actualUrl: c.actualUrl ?? mediaMap.get(c.actualMediaId),
      }));

    return {
      ...project,
      media,
      comparisonPairs,
    };
  }

  async createProject(
    data: Omit<FeaturedProject, "id"> & { id?: string }
  ): Promise<FeaturedProject> {
    const duplicateCode = mockStore.landing.featuredProjects.some(
      (p) => p.code.toLowerCase() === data.code.toLowerCase()
    );
    if (duplicateCode) {
      const err = new Error(`Project code '${data.code}' already exists`);
      (err as Error & { statusCode?: number }).statusCode = 409;
      throw err;
    }

    const newProject: FeaturedProject = {
      ...data,
      id: data.id || `project-${Date.now()}`,
    };
    mockStore.landing.featuredProjects.push(newProject);
    return newProject;
  }

  async updateProject(
    id: string,
    data: Partial<FeaturedProject>
  ): Promise<FeaturedProject | null> {
    const index = mockStore.landing.featuredProjects.findIndex(
      (p) => p.id === id
    );
    if (index === -1) {
      return null;
    }

    if (data.code) {
      const duplicateCode = mockStore.landing.featuredProjects.some(
        (p) => p.id !== id && p.code.toLowerCase() === data.code!.toLowerCase()
      );
      if (duplicateCode) {
        const err = new Error(`Project code '${data.code}' already exists`);
        (err as Error & { statusCode?: number }).statusCode = 409;
        throw err;
      }
    }

    const updated = { ...mockStore.landing.featuredProjects[index], ...data };
    mockStore.landing.featuredProjects[index] = updated;
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    const prevLen = mockStore.landing.featuredProjects.length;
    mockStore.landing.featuredProjects =
      mockStore.landing.featuredProjects.filter((p) => p.id !== id);
    if (mockStore.landing.featuredProjects.length < prevLen) {
      mockStore.landingPlacements = mockStore.landingPlacements.filter(
        (pl) => pl.projectId !== id
      );
      return true;
    }
    return false;
  }

  async getHeroSlides(): Promise<HeroSlide[]> {
    const heroPlacements = await this.getPlacements("HERO_SLIDE");
    if (heroPlacements.length === 0) {
      return mockStore.landing.heroSlides;
    }

    const projectMap = new Map(
      mockStore.landing.featuredProjects.map((p) => [p.id, p])
    );

    return heroPlacements.map((pl) => {
      const meta = (pl.customMeta ?? {}) as Record<string, string>;
      const proj = projectMap.get(pl.projectId);
      return {
        id: meta.slideId ?? pl.id,
        image: meta.image ?? proj?.coverImage ?? "",
        tag: meta.tag ?? proj?.categoryTag ?? "",
        title: meta.title ?? proj?.title ?? "",
        location: meta.location ?? proj?.locations[0] ?? "",
        specs: meta.specs ?? proj?.scaleMetric ?? "",
        lightingMode: meta.lightingMode ?? "Architectural Daylight",
      };
    });
  }

  async updateHeroSlides(slides: HeroSlide[]): Promise<HeroSlide[]> {
    mockStore.landing.heroSlides = slides;
    return slides;
  }

  async getLegalInfo(): Promise<CompanyLegalInfo> {
    return mockStore.landing.companyLegalInfo;
  }

  async updateLegalInfo(
    info: Partial<CompanyLegalInfo>
  ): Promise<CompanyLegalInfo> {
    const updated = { ...mockStore.landing.companyLegalInfo, ...info };
    mockStore.landing.companyLegalInfo = updated;
    return updated;
  }

  async getPlacements(
    slotType?: LandingPlacementSlot
  ): Promise<LandingPlacement[]> {
    const list = slotType
      ? mockStore.landingPlacements.filter((p) => p.slotType === slotType)
      : mockStore.landingPlacements;
    return [...list].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async upsertPlacement(
    input: UpsertLandingPlacement
  ): Promise<LandingPlacement> {
    const projectExists = mockStore.landing.featuredProjects.some(
      (p) => p.id === input.projectId
    );
    if (!projectExists) {
      const err = new Error(
        `Project with id '${input.projectId}' does not exist`
      );
      (err as Error & { statusCode?: number }).statusCode = 400;
      throw err;
    }

    const now = new Date().toISOString();
    if (input.id) {
      const idx = mockStore.landingPlacements.findIndex(
        (p) => p.id === input.id
      );
      if (idx !== -1) {
        const updated: LandingPlacement = {
          ...mockStore.landingPlacements[idx],
          slotType: input.slotType,
          projectId: input.projectId,
          sortOrder: input.sortOrder,
          customMeta: input.customMeta ?? null,
          updatedAt: now,
        };
        mockStore.landingPlacements[idx] = updated;
        return updated;
      }
    }

    const created: LandingPlacement = {
      id: input.id || `pl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      slotType: input.slotType,
      projectId: input.projectId,
      sortOrder: input.sortOrder,
      customMeta: input.customMeta ?? null,
      createdAt: now,
      updatedAt: now,
    };
    mockStore.landingPlacements.push(created);
    return created;
  }

  async deletePlacement(id: string): Promise<boolean> {
    const prevLen = mockStore.landingPlacements.length;
    mockStore.landingPlacements = mockStore.landingPlacements.filter(
      (p) => p.id !== id
    );
    return mockStore.landingPlacements.length < prevLen;
  }
}
