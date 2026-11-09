import React from 'react';
import type { PartnerBrand } from '@khangviet/types';
import { usePartnerBrands } from '@/components/contexts/LandingContext';

export interface TrustMarqueeProps {
  brands?: PartnerBrand[];
}

export const TrustMarquee: React.FC<TrustMarqueeProps> = ({ brands }) => {
  const contextBrands = usePartnerBrands();
  const activeBrands = brands && brands.length > 0 ? brands : contextBrands;

  return (
    <section className="overflow-hidden border-b border-white/8 bg-[#14161a] py-8" aria-label="Đối tác tiêu biểu">
      <div className="mb-6 flex items-center justify-center gap-3 px-5">
        <span className="h-px w-8 bg-white/15" />
        <span className="font-mono-tech text-[9px] uppercase tracking-[0.25em] text-(--text-secondary)">
          Trusted by leading corporations
        </span>
        <span className="h-px w-8 bg-white/15" />
      </div>
      <div className="animate-marquee">
        {[...activeBrands, ...activeBrands].map((partner, index) => (
          <div
            key={`${partner.name}-${index}`}
            className="group mx-2 flex min-w-56 items-center gap-4 border border-white/6 px-5 py-4 transition-colors hover:border-(--border-bronze-subtle)"
          >
            <span className="font-syne text-sm font-bold text-(--text-secondary) transition-colors group-hover:text-(--text-primary)">
              {partner.name}
            </span>
            <span className="font-mono-tech text-[8px] uppercase tracking-wider text-white/30">
              {partner.category}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustMarquee;
