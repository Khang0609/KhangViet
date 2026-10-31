import type {
  LandingContent,
  FeaturedProject,
  HeroSlide,
  CompanyLegalInfo,
  PendingChange,
  ChangeActionType,
  SyncStatus,
} from "@khangviet/types";

export interface ICmsRepository {
  getLandingData(): Promise<LandingContent>;
  getProjects(): Promise<FeaturedProject[]>;
  getProjectById(id: string): Promise<FeaturedProject | null>;
  createProject(
    project: Omit<FeaturedProject, "id"> & { id?: string }
  ): Promise<FeaturedProject>;
  updateProject(
    id: string,
    project: Partial<FeaturedProject>
  ): Promise<FeaturedProject | null>;
  deleteProject(id: string): Promise<boolean>;
  updateHeroSlides(slides: HeroSlide[]): Promise<HeroSlide[]>;
  updateLegalInfo(info: Partial<CompanyLegalInfo>): Promise<CompanyLegalInfo>;

  // Pending changes & Midnight sync methods
  getPendingChanges(): Promise<PendingChange[]>;
  enqueueChange(
    action: ChangeActionType,
    payload: unknown,
    targetId?: string
  ): Promise<PendingChange>;
  applyPendingChanges(): Promise<{ appliedCount: number; success: boolean }>;
  discardPendingChange(id: string): Promise<boolean>;
  getSyncStatus(): Promise<SyncStatus>;
}
