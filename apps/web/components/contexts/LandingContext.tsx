"use client";

import React, { createContext, useContext, ReactNode } from "react";
import type { LandingContent, CompanyLegalInfo, PartnerBrand } from "@khangviet/types";
import { COMPANY_LEGAL_INFO, PARTNER_BRANDS } from "@/data/khangVietData";

interface LandingContextValue {
  landing: LandingContent | null;
  legalInfo: CompanyLegalInfo;
  partnerBrands: PartnerBrand[];
}

const LandingContext = createContext<LandingContextValue | null>(null);

export const LandingProvider: React.FC<{
  content: LandingContent;
  children: ReactNode;
}> = ({ content, children }) => {
  return (
    <LandingContext.Provider
      value={{
        landing: content,
        legalInfo: content.companyLegalInfo || COMPANY_LEGAL_INFO,
        partnerBrands: content.partnerBrands || PARTNER_BRANDS,
      }}
    >
      {children}
    </LandingContext.Provider>
  );
};

export function useLandingContext(): LandingContextValue {
  const context = useContext(LandingContext);
  if (!context) {
    return {
      landing: null,
      legalInfo: COMPANY_LEGAL_INFO,
      partnerBrands: PARTNER_BRANDS,
    };
  }
  return context;
}

export function useLegalInfo(): CompanyLegalInfo {
  return useLandingContext().legalInfo;
}
