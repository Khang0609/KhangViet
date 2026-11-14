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
    <article className="group rounded-xl border border-white/8 bg-white/3 p-5 transition-colors hover:border-white/20">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base font-semibold text-white">
          {division.name}
        </h3>
        <DivisionIcon className="h-4 w-4 shrink-0 text-white/40 transition-colors group-hover:text-(--accent-bronze)" />
      </div>
      <div className="my-4 flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-(--accent-bronze)">
          {division.headcount}
        </span>
        <span className="text-xs text-white/60">
          {division.unitLabel}
        </span>
      </div>
      <p className="text-xs leading-relaxed text-white/70">
        {division.role}
      </p>
      <p className="mt-3 border-t border-white/8 pt-3 text-[11px] leading-relaxed text-white/50">
        {division.equipment}
      </p>
    </article>
  );
};

