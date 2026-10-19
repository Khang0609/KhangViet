import type {
  LandingContent,
  FeaturedProject,
  HeroSlide,
  CompanyLegalInfo,
  PendingChange,
  ChangeActionType,
} from "@khangviet/types";
import { mockStore } from "./store";

export function applySingleChange(
  change: PendingChange,
  landing: LandingContent
): void {
  switch (change.action) {
    case "UPDATE_PROJECT": {
      if (!change.targetId) return;
      const idx = landing.featuredProjects.findIndex(
        (p) => p.id === change.targetId
      );
      if (idx !== -1) {
        landing.featuredProjects[idx] = {
          ...landing.featuredProjects[idx],
          ...(change.payload as Partial<FeaturedProject>),
        };
      }
      break;
    }
    case "CREATE_PROJECT": {
      const p = change.payload as FeaturedProject;
      const newProj = { ...p, id: p.id || `project-${Date.now()}` };
      landing.featuredProjects.push(newProj);
      break;
    }
    case "DELETE_PROJECT": {
      if (!change.targetId) return;
      landing.featuredProjects = landing.featuredProjects.filter(
        (p) => p.id !== change.targetId
      );
      break;
    }
    case "UPDATE_HERO": {
      landing.heroSlides = change.payload as HeroSlide[];
      break;
    }
    case "UPDATE_LEGAL": {
      landing.companyLegalInfo = {
        ...landing.companyLegalInfo,
        ...(change.payload as Partial<CompanyLegalInfo>),
      };
      break;
    }
  }
}

