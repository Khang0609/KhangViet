import { initialLandingContent } from "@khangviet/data";
import type {
  LandingContent,
  FeaturedProject,
  HeroSlide,
  CompanyLegalInfo,
  PendingChange,
  ChangeActionType,
  SyncStatus,
} from "@khangviet/types";
import { ICmsRepository } from "../../interfaces/ICmsRepository";
import { type D1Client } from "../client";
import { D1CmsProjectRepo } from "./d1-cms-project-repo";
import { D1CmsMetaRepo } from "./d1-cms-meta-repo";

export class D1CmsRepository implements ICmsRepository {
  private readonly projectRepo: D1CmsProjectRepo;
  private readonly metaRepo: D1CmsMetaRepo;

  constructor(client: D1Client) {
    this.projectRepo = new D1CmsProjectRepo(client);
    this.metaRepo = new D1CmsMetaRepo(client);
  }

  async getLandingData(): Promise<LandingContent> {
    const [projects, heroSlides, legalInfo] = await Promise.all([
      this.projectRepo.getProjects(),
      this.metaRepo.getHeroSlides(),
      this.metaRepo.getLegalInfo(),
    ]);
    return {
      ...initialLandingContent,
      heroSlides,
      featuredProjects:
        projects.length > 0 ? projects : initialLandingContent.featuredProjects,
      companyLegalInfo: legalInfo,
    };
  }

  async getProjects(): Promise<FeaturedProject[]> {
    return this.projectRepo.getProjects();
  }

  async getProjectById(id: string): Promise<FeaturedProject | null> {
    return this.projectRepo.getProjectById(id);
  }

  async createProject(
    data: Omit<FeaturedProject, "id"> & { id?: string }
  ): Promise<FeaturedProject> {
    return this.projectRepo.createProject(data);
  }

  async updateProject(
    id: string,
    data: Partial<FeaturedProject>
  ): Promise<FeaturedProject | null> {
    return this.projectRepo.updateProject(id, data);
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.projectRepo.deleteProject(id);
  }

  async updateHeroSlides(slides: HeroSlide[]): Promise<HeroSlide[]> {
    return this.metaRepo.setHeroSlides(slides);
  }

  async updateLegalInfo(
    info: Partial<CompanyLegalInfo>
  ): Promise<CompanyLegalInfo> {
    return this.metaRepo.setLegalInfo(info);
  }

  async getPendingChanges(): Promise<PendingChange[]> {
    return this.metaRepo.getPendingChanges();
  }

  async enqueueChange(
    action: ChangeActionType,
    payload: unknown,
    targetId?: string
  ): Promise<PendingChange> {
    return this.metaRepo.enqueueChange(action, payload, targetId);
  }

  async applyPendingChanges(): Promise<{ appliedCount: number; success: boolean }> {
    const pendings = await this.metaRepo.getPendingChanges();
    for (const change of pendings) {
      if (change.action === "UPDATE_HERO") {
        await this.metaRepo.setHeroSlides(change.payload as HeroSlide[]);
      } else if (change.action === "UPDATE_LEGAL") {
        await this.metaRepo.setLegalInfo(change.payload as Partial<CompanyLegalInfo>);
      } else if (change.action === "CREATE_PROJECT") {
        await this.projectRepo.createProject(change.payload as FeaturedProject);
      } else if (change.action === "UPDATE_PROJECT" && change.targetId) {
        await this.projectRepo.updateProject(change.targetId, change.payload as Partial<FeaturedProject>);
      } else if (change.action === "DELETE_PROJECT" && change.targetId) {
        await this.projectRepo.deleteProject(change.targetId);
      }
      await this.metaRepo.markChangeApplied(change.id);
    }
    return { appliedCount: pendings.length, success: true };
  }

  async discardPendingChange(id: string): Promise<boolean> {
    return this.metaRepo.discardChange(id);
  }

  async getSyncStatus(): Promise<SyncStatus> {
    const pendings = await this.metaRepo.getPendingChanges();
    const now = new Date();
    const currentHourVN = (now.getUTCHours() + 7) % 24;
    return {
      isMidnightWindow: currentHourVN >= 0 && currentHourVN < 2,
      hasPendingChanges: pendings.length > 0,
      pendingCount: pendings.length,
      serverTime: now.toISOString(),
      currentHourVN,
    };
  }
}
