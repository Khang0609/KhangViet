"use client";

import React, { createContext, useContext, ReactNode } from "react";
import type {
  LandingContent,
  CompanyLegalInfo,
  PartnerBrand,
  HeroSlide,
  CoreDiscipline,
  FeaturedProject,
  ProductionDivision,
} from "@khangviet/types";
import { initialLandingContent } from "@khangviet/data";

export interface LandingContextValue {
  landing: LandingContent;
  heroSlides: HeroSlide[];
  partnerBrands: PartnerBrand[];
  coreDisciplines: CoreDiscipline[];
  featuredProjects: FeaturedProject[];
  productionDivisions: ProductionDivision[];
  legalInfo: CompanyLegalInfo;
}

const LandingContext = createContext<LandingContextValue | null>(null);

export const LandingProvider: React.FC<{
  content: LandingContent;
  children: ReactNode;
}> = ({ content, children }) => {

  const value: LandingContextValue = {
    landing: content,
    heroSlides:
      content?.heroSlides && content.heroSlides.length > 0
        ? content.heroSlides
        : initialLandingContent.heroSlides,
    partnerBrands:
      content?.partnerBrands && content.partnerBrands.length > 0
        ? content.partnerBrands
        : initialLandingContent.partnerBrands,
    coreDisciplines:
      content?.coreDisciplines && content.coreDisciplines.length > 0
        ? content.coreDisciplines
        : initialLandingContent.coreDisciplines,
    featuredProjects:
      content?.featuredProjects && content.featuredProjects.length > 0
        ? content.featuredProjects
        : initialLandingContent.featuredProjects,
    productionDivisions:
      content?.productionDivisions && content.productionDivisions.length > 0
        ? content.productionDivisions
        : initialLandingContent.productionDivisions,
    legalInfo: content?.companyLegalInfo || initialLandingContent.companyLegalInfo,
  };

  return (
    <LandingContext.Provider value={value}>{children}</LandingContext.Provider>
  );
};

export function useLandingContext(): LandingContextValue {
  const context = useContext(LandingContext);
  if (!context) {
    return {
      landing: initialLandingContent,
      heroSlides: initialLandingContent.heroSlides,
      partnerBrands: initialLandingContent.partnerBrands,
      coreDisciplines: initialLandingContent.coreDisciplines,
      featuredProjects: initialLandingContent.featuredProjects,
      productionDivisions: initialLandingContent.productionDivisions,
      legalInfo: initialLandingContent.companyLegalInfo,
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

export function usePartnerBrands(): PartnerBrand[] {
  return useLandingContext().partnerBrands;
}

export function useHeroSlides(): HeroSlide[] {
  return useLandingContext().heroSlides;
}

export function useFeaturedProjects(): FeaturedProject[] {
  return useLandingContext().featuredProjects;
}

export function useCoreDisciplines(): CoreDiscipline[] {
  return useLandingContext().coreDisciplines;
}
