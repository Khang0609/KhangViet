"use client";

import React from "react";
import type { PartnerBrand } from "@khangviet/types";
import { usePartnerBrands } from "@/components/contexts/LandingContext";

export interface TrustMarqueeProps {
  brands?: PartnerBrand[];
}

export const TrustMarquee: React.FC<TrustMarqueeProps> = ({ brands }) => {
  const contextBrands = usePartnerBrands();
  const activeBrands = brands && brands.length > 0 ? brands : contextBrands;

  return (
    <section
      className="overflow-hidden border-b border-black/8 bg-[#eae5dc]/60 py-7"
      aria-label="Đối tác tiêu biểu"
    >
      <div className="mb-5 flex items-center justify-center gap-3 px-5">
        <span className="text-xs font-medium tracking-[0.18em] text-[#625f5a] uppercase">
          Đối tác tin tưởng đồng hành
        </span>
      </div>
      <div className="animate-marquee">
        {[...activeBrands, ...activeBrands].map((partner, index) => (
          <div
            key={`${partner.name}-${index}`}
            className="mx-6 flex items-baseline gap-2.5 py-1"
          >
            <span className="text-base font-semibold tracking-tight text-[#1a1918]">
              {partner.name}
            </span>
            <span className="text-xs text-[#625f5a]">
              {partner.category}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustMarquee;
