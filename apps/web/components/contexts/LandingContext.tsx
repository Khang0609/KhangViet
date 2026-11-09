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
import {
  HERO_SLIDES,
  PARTNER_BRANDS,
  CORE_DISCIPLINES,
  FEATURED_PROJECTS,
  PRODUCTION_DIVISIONS,
  COMPANY_LEGAL_INFO,
} from "@/data/khangVietData";

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
        : HERO_SLIDES,
    partnerBrands:
      content?.partnerBrands && content.partnerBrands.length > 0
        ? content.partnerBrands
        : PARTNER_BRANDS,
    coreDisciplines:
      content?.coreDisciplines && content.coreDisciplines.length > 0
        ? content.coreDisciplines
        : CORE_DISCIPLINES,
    featuredProjects:
      content?.featuredProjects && content.featuredProjects.length > 0
        ? content.featuredProjects
        : FEATURED_PROJECTS,
    productionDivisions:
      content?.productionDivisions && content.productionDivisions.length > 0
        ? content.productionDivisions
        : PRODUCTION_DIVISIONS,
    legalInfo: content?.companyLegalInfo || COMPANY_LEGAL_INFO,
  };

  return (
    <LandingContext.Provider value={value}>{children}</LandingContext.Provider>
  );
};

export function useLandingContext(): LandingContextValue {
  const context = useContext(LandingContext);
  if (!context) {
    return {
      landing: {} as LandingContent,
      heroSlides: HERO_SLIDES,
      partnerBrands: PARTNER_BRANDS,
      coreDisciplines: CORE_DISCIPLINES,
      featuredProjects: FEATURED_PROJECTS,
      productionDivisions: PRODUCTION_DIVISIONS,
      legalInfo: COMPANY_LEGAL_INFO,
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
