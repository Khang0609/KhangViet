import type {
  LandingContent,
  FeaturedProject,
  HeroSlide,
  CompanyLegalInfo,
  PendingChange,
  ChangeActionType,
  SyncStatus,
} from "@khangviet/types";
import { ICmsRepository } from "../interfaces/ICmsRepository";
import { mockStore } from "./store";
import { applySingleChange } from "./changeApplier";

export class JsonCmsRepository implements ICmsRepository {
  async getLandingData(): Promise<LandingContent> {
    return mockStore.landing;
  }

  async getProjects(): Promise<FeaturedProject[]> {
    return mockStore.landing.featuredProjects;
  }

  async getProjectById(id: string): Promise<FeaturedProject | null> {
    const project = mockStore.landing.featuredProjects.find((p) => p.id === id);
    return project ? { ...project } : null;
  }

  async createProject(
    data: Omit<FeaturedProject, "id"> & { id?: string }
  ): Promise<FeaturedProject> {
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
    const updated = { ...mockStore.landing.featuredProjects[index], ...data };
    mockStore.landing.featuredProjects[index] = updated;
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    const prevLen = mockStore.landing.featuredProjects.length;
    mockStore.landing.featuredProjects =
      mockStore.landing.featuredProjects.filter((p) => p.id !== id);
    return mockStore.landing.featuredProjects.length < prevLen;
  }

  async getHeroSlides(includeDraft: boolean = true): Promise<HeroSlide[]> {
    if (includeDraft && mockStore.draftHeroSlides) {
      return mockStore.draftHeroSlides;
    }
    return mockStore.landing.heroSlides;
  }

  async updateHeroSlides(slides: HeroSlide[]): Promise<HeroSlide[]> {
    mockStore.draftHeroSlides = slides;
    return slides;
  }

  async getLegalInfo(includeDraft: boolean = true): Promise<CompanyLegalInfo> {
    if (includeDraft && mockStore.draftLegalInfo) {
      return mockStore.draftLegalInfo;
    }
    return mockStore.landing.companyLegalInfo;
  }

  async updateLegalInfo(
    info: Partial<CompanyLegalInfo>
  ): Promise<CompanyLegalInfo> {
    const current = await this.getLegalInfo(true);
    const updated = { ...current, ...info };
    mockStore.draftLegalInfo = updated;
    return updated;
  }


  async getPendingChanges(): Promise<PendingChange[]> {
    return mockStore.pendingChanges.filter((c) => c.status === "PENDING");
  }

  async enqueueChange(
    action: ChangeActionType,
    payload: unknown,
    targetId?: string
  ): Promise<PendingChange> {
    const change: PendingChange = {
      id: `change-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action,
      targetId,
      payload,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    mockStore.pendingChanges.push(change);
    return change;
  }

  async applyPendingChanges(): Promise<{ appliedCount: number; success: boolean }> {
    let appliedCount = 0;
    if (mockStore.draftHeroSlides) {
      mockStore.landing.heroSlides = mockStore.draftHeroSlides;
      mockStore.draftHeroSlides = undefined;
      appliedCount++;
    }
    if (mockStore.draftLegalInfo) {
      mockStore.landing.companyLegalInfo = mockStore.draftLegalInfo;
      mockStore.draftLegalInfo = undefined;
      appliedCount++;
    }

    const pendings = mockStore.pendingChanges.filter((c) => c.status === "PENDING");
    if (pendings.length > 0) {
      const nowIso = new Date().toISOString();
      for (const change of pendings) {
        applySingleChange(change, mockStore.landing);
        change.status = "APPLIED";
        change.appliedAt = nowIso;
      }
      appliedCount += pendings.length;
    }

    return { appliedCount, success: true };
  }

  async discardPendingChange(id: string): Promise<boolean> {
    const change = mockStore.pendingChanges.find((c) => c.id === id);
    if (!change) return false;
    change.status = "DISCARDED";
    return true;
  }

  async getSyncStatus(): Promise<SyncStatus> {
    const now = new Date();
    const vnHour = (now.getUTCHours() + 7) % 24;
    const pendingChanges = mockStore.pendingChanges.filter((c) => c.status === "PENDING");
    let count = pendingChanges.length;
    if (mockStore.draftHeroSlides) count++;
    if (mockStore.draftLegalInfo) count++;
    return {
      isMidnightWindow: vnHour >= 0 && vnHour < 2,
      hasPendingChanges: count > 0,
      pendingCount: count,
      serverTime: now.toISOString(),
      currentHourVN: vnHour,
    };
  }
}
