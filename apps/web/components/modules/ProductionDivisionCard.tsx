import React from "react";
import { Factory, Hammer, Layers3, Sparkles, LucideIcon } from "lucide-react";
import type { ProductionDivision } from "@khangviet/types";

const DIVISION_ICONS: LucideIcon[] = [Hammer, Sparkles, Layers3, Factory];

export interface ProductionDivisionCardProps {
  division: ProductionDivision;
  index: number;
}

export const ProductionDivisionCard: React.FC<ProductionDivisionCardProps> = ({
  division,
  index,
}) => {
  const DivisionIcon = DIVISION_ICONS[index] || Factory;

  return (
    <article className="group border border-white/8 bg-[#15171a] p-5 transition-colors hover:border-(--border-bronze-subtle)">
      <div className="flex items-start justify-between gap-5">
        <div>
          <div className="font-mono-tech text-[9px] tracking-widest text-(--accent-bronze)">
            {division.code}
          </div>
          <h3 className="font-syne mt-2 text-base font-bold">
            {division.name}
          </h3>
        </div>
        <DivisionIcon className="h-5 w-5 text-(--text-secondary) transition-colors group-hover:text-(--accent-bronze)" />
      </div>
      <div className="my-5 flex items-end gap-2">
        <span className="font-syne text-5xl font-bold text-(--accent-bronze)">
          {division.headcount}
        </span>
        <span className="pb-1 text-[10px] leading-4 text-(--text-secondary) uppercase">
          {division.unitLabel}
        </span>
      </div>
      <p className="text-[11px] leading-5 text-(--text-secondary)">
        {division.role}
      </p>
      <p className="font-mono-tech mt-4 border-t border-white/6 pt-3 text-[9px] leading-4 text-white/50">
        EQUIPMENT // {division.equipment}
      </p>
    </article>
  );
};

