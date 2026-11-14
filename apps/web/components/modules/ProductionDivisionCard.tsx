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
    <article className="group flex flex-col rounded-xl border border-black/8 bg-[#f4f1ea]/55 p-5 transition-colors hover:border-black/20">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base font-semibold text-[#1a1918]">
          {division.name}
        </h3>
        <DivisionIcon className="h-4 w-4 shrink-0 text-[#625f5a] transition-colors group-hover:text-(--accent-bronze)" />
      </div>
      <div className="my-4 flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-(--accent-bronze)">
          {division.headcount}
        </span>
        <span className="text-xs text-[#625f5a]">
          {division.unitLabel}
        </span>
      </div>
      <p className="flex-1 text-xs leading-relaxed text-[#625f5a]">
        {division.role}
      </p>
      <p className="mt-3 border-t border-black/8 pt-3 text-[11px] leading-relaxed text-[#625f5a]/80">
        {division.equipment}
      </p>
    </article>
  );
};

