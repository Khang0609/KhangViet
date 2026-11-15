import React from "react";
import type { ProductionDivision } from "@khangviet/types";

export interface ProductionDivisionCardProps {
  division: ProductionDivision;
  index: number;
}

export const ProductionDivisionCard: React.FC<ProductionDivisionCardProps> = ({
  division,
}) => {
  return (
    <article className="group grid gap-4 py-6 first:pt-2 last:pb-2 sm:grid-cols-12 sm:items-baseline">
      <div className="flex items-baseline gap-2.5 sm:col-span-3">
        <span className="text-3xl font-semibold tracking-tight text-(--accent-bronze) tabular-nums">
          {division.headcount}
        </span>
        <span className="text-xs font-medium text-[#625f5a]">
          {division.unitLabel}
        </span>
      </div>

      <div className="sm:col-span-9">
        <h3 className="text-base font-semibold text-[#1a1918] transition-colors group-hover:text-(--accent-bronze)">
          {division.name}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-[#625f5a]">
          {division.role}
        </p>
        <p className="mt-2.5 text-xs text-[#625f5a]/85">
          Thiết bị: {division.equipment}
        </p>
      </div>
    </article>
  );
};

