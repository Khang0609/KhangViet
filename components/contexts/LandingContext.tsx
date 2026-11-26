"use client";

import React, { createContext, useContext, ReactNode } from "react";
import type {
  LandingContent,
  CompanyLegalInfo,
  Organization,
  HeroSlide,
  CoreDiscipline,
  Project,
  ProductionDivision,
} from "@/types/landing";
import { getLandingContent } from "@/lib/landingData";

export interface LandingContextValue {
  landing: LandingContent;
  heroSlides: HeroSlide[];
  featuredOrganizations: Organization[];
  coreDisciplines: CoreDiscipline[];
  featuredProjects: Project[];
  productionDivisions: ProductionDivision[];
  legalInfo: CompanyLegalInfo;
}

const LandingContext = createContext<LandingContextValue | null>(null);

export const LandingProvider: React.FC<{
  content: LandingContent;
  children: ReactNode;
}> = ({ content, children }) => {
  const fallback = getLandingContent();

  const value: LandingContextValue = {
    landing: content,
    heroSlides:
      content?.heroSlides && content.heroSlides.length > 0
        ? content.heroSlides
        : fallback.heroSlides,
    featuredOrganizations:
      content?.featuredOrganizations && content.featuredOrganizations.length > 0
        ? content.featuredOrganizations
        : fallback.featuredOrganizations,
    coreDisciplines:
      content?.coreDisciplines && content.coreDisciplines.length > 0
        ? content.coreDisciplines
        : fallback.coreDisciplines,
    featuredProjects:
      content?.featuredProjects && content.featuredProjects.length > 0
        ? content.featuredProjects
        : fallback.featuredProjects,
    productionDivisions:
      content?.productionDivisions && content.productionDivisions.length > 0
        ? content.productionDivisions
        : fallback.productionDivisions,
    legalInfo: content?.companyLegalInfo || fallback.companyLegalInfo,
  };

  return (
    <LandingContext.Provider value={value}>{children}</LandingContext.Provider>
  );
};

export function useLandingContext(): LandingContextValue {
  const context = useContext(LandingContext);
  if (!context) {
    const fallback = getLandingContent();
    return {
      landing: fallback,
      heroSlides: fallback.heroSlides,
      featuredOrganizations: fallback.featuredOrganizations,
      coreDisciplines: fallback.coreDisciplines,
      featuredProjects: fallback.featuredProjects,
      productionDivisions: fallback.productionDivisions,
      legalInfo: fallback.companyLegalInfo,
    };
  }
  return context;
}

export function useLegalInfo(): CompanyLegalInfo {
  return useLandingContext().legalInfo;
}

export function useProductionDivisions(): ProductionDivision[] {
  return useLandingContext().productionDivisions;
}

export function useFeaturedOrganizations(): Organization[] {
  return useLandingContext().featuredOrganizations;
}

export function useHeroSlides(): HeroSlide[] {
  return useLandingContext().heroSlides;
}

export function useCoreDisciplines(): CoreDiscipline[] {
  return useLandingContext().coreDisciplines;
}

export function useFeaturedProjects(): Project[] {
  return useLandingContext().featuredProjects;
}
