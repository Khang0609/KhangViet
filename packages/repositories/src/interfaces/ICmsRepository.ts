import type {
  LandingContent,
  FeaturedProject,
  ProjectDetail,
  ProjectListQuery,
  PaginationMeta,
  GalleryApiResponse,
  HeroSlide,
  CompanyLegalInfo,
  LandingPlacement,
  LandingPlacementSlot,
  UpsertLandingPlacement,
} from "@khangviet/types";

export interface ICmsRepository {
  getLandingData(): Promise<LandingContent>;
  getProjects(includeDrafts?: boolean): Promise<FeaturedProject[]>;
  queryProjects(
    query: ProjectListQuery
  ): Promise<{ items: FeaturedProject[]; pagination: PaginationMeta }>;
  getGalleryData(query: ProjectListQuery): Promise<GalleryApiResponse>;
  getProjectById(id: string): Promise<FeaturedProject | null>;
  getProjectDetailById(id: string): Promise<ProjectDetail | null>;
  createProject(
    project: Omit<FeaturedProject, "id"> & { id?: string }
  ): Promise<FeaturedProject>;
  updateProject(
    id: string,
    project: Partial<FeaturedProject>
  ): Promise<FeaturedProject | null>;
  deleteProject(id: string): Promise<boolean>;
  getHeroSlides(includeDraft?: boolean): Promise<HeroSlide[]>;
  updateHeroSlides(slides: HeroSlide[]): Promise<HeroSlide[]>;
  getLegalInfo(includeDraft?: boolean): Promise<CompanyLegalInfo>;
  updateLegalInfo(info: Partial<CompanyLegalInfo>): Promise<CompanyLegalInfo>;

  // Curated Landing Placements
  getPlacements(slotType?: LandingPlacementSlot): Promise<LandingPlacement[]>;
  upsertPlacement(input: UpsertLandingPlacement): Promise<LandingPlacement>;
  deletePlacement(id: string): Promise<boolean>;
}
