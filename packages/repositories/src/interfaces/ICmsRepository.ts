import type {
  CompanyLegalInfo,
  CreateOrganizationDto,
  CreateProjectDto,
  CreateProjectMediaDto,
  GalleryClusterConfig,
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

export interface ProjectQueryOptions {
  includeDrafts?: boolean;
  organizationId?: string;
  serviceId?: string;
  search?: string;
}

export interface GalleryQueryOptions {
  serviceSlug?: string;
  organizationSlug?: string;
  search?: string;
}

export interface ICmsRepository {
  getLandingData(): Promise<LandingContent>;
  getGalleryData(options?: GalleryQueryOptions): Promise<ProjectGalleryResponse>;

  // Projects
  getProjects(options?: ProjectQueryOptions): Promise<Project[]>;
  getProjectById(id: string): Promise<Project | null>;
  getProjectBySlug(slug: string, includeDrafts?: boolean): Promise<Project | null>;
  createProject(input: CreateProjectDto): Promise<Project>;
  updateProject(id: string, input: UpdateProjectDto): Promise<Project | null>;
  deleteProject(id: string): Promise<boolean>;

  // Project Media & Comparisons
  addProjectMedia(
    projectId: string,
    input: CreateProjectMediaDto
  ): Promise<ProjectMedia>;
  deleteProjectMedia(mediaId: string): Promise<boolean>;
  setProjectComparison(
    projectId: string,
    renderMediaId: string,
    actualMediaId: string
  ): Promise<ProjectComparison>;

  // Organizations (Partners / Brands)
  getOrganizations(): Promise<Organization[]>;
  getOrganizationById(id: string): Promise<Organization | null>;
  createOrganization(input: CreateOrganizationDto): Promise<Organization>;
  updateOrganization(
    id: string,
    input: UpdateOrganizationDto
  ): Promise<Organization | null>;
  deleteOrganization(id: string): Promise<boolean>;

  // Services
  getServices(): Promise<Service[]>;

  // Site Settings
  getSiteSetting<T>(key: SiteSettingKey): Promise<T | null>;
  upsertSiteSetting<T>(key: SiteSettingKey, value: T): Promise<void>;
  getHeroSlides(): Promise<HeroSlide[]>;
  updateHeroSlides(slides: HeroSlide[]): Promise<HeroSlide[]>;
  getLegalInfo(): Promise<CompanyLegalInfo>;
  updateLegalInfo(info: Partial<CompanyLegalInfo>): Promise<CompanyLegalInfo>;
  getGalleryClusters(): Promise<GalleryClusterConfig[]>;
  updateGalleryClusters(
    clusters: GalleryClusterConfig[]
  ): Promise<GalleryClusterConfig[]>;
}
