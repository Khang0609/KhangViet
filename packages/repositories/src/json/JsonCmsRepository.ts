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
  ): Promise<FeaturedProject> {
    const index = mockStore.landing.featuredProjects.findIndex(
      (p) => p.id === id
    );
    if (index === -1) {
      throw new Error(`Project with id ${id} not found`);
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

  async updateHeroSlides(slides: HeroSlide[]): Promise<HeroSlide[]> {
    mockStore.landing.heroSlides = slides;
    return slides;
  }

  async updateLegalInfo(
    info: Partial<CompanyLegalInfo>
  ): Promise<CompanyLegalInfo> {
    mockStore.landing.companyLegalInfo = {
      ...mockStore.landing.companyLegalInfo,
      ...info,
    };
    return mockStore.landing.companyLegalInfo;
  }

  isMidnightWindow(): boolean {
    const now = new Date();
    // Giờ VN (GMT+7)
    const vnHour = (now.getUTCHours() + 7) % 24;
    return vnHour >= 0 && vnHour < 2;
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
    const pendings = mockStore.pendingChanges.filter((c) => c.status === "PENDING");
    if (pendings.length === 0) {
      return { appliedCount: 0, success: true };
    }

    const nowIso = new Date().toISOString();
    for (const change of pendings) {
      applySingleChange(change, mockStore.landing);
      change.status = "APPLIED";
      change.appliedAt = nowIso;
    }

    return { appliedCount: pendings.length, success: true };
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
    const pending = mockStore.pendingChanges.filter((c) => c.status === "PENDING");
    return {
      isMidnightWindow: vnHour >= 0 && vnHour < 2,
      hasPendingChanges: pending.length > 0,
      pendingCount: pending.length,
      serverTime: now.toISOString(),
      currentHourVN: vnHour,
    };
  }
}
