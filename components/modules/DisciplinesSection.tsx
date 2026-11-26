"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import type { CoreDiscipline } from "@/types/landing";
import { useCoreDisciplines } from "@/components/contexts/LandingContext";
import { SectionHeading } from "../ui/SectionHeading";

export interface DisciplinesSectionProps {
  disciplines?: CoreDiscipline[];
}

export const DisciplinesSection: React.FC<DisciplinesSectionProps> = ({
  disciplines,
}) => {
  const contextDisciplines = useCoreDisciplines();
  const activeDisciplines =
    disciplines && disciplines.length > 0 ? disciplines : contextDisciplines;

  return (
    <section id="linh-vuc" className="scroll-mt-20 bg-[#f4f1ea] py-20 md:py-28">
      <div className="mx-auto max-w-360 px-5 md:px-8 xl:px-12">
        <SectionHeading
          eyebrow="Lĩnh vực cốt lõi"
          title="Ba trụ cột. Một tiêu chuẩn hoàn thiện."
          description="Từ kiến trúc mặt dựng quy mô lớn đến từng chi tiết trưng bày — mọi hạng mục được kiểm soát xuyên suốt bởi cùng một đội ngũ."
        />
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {activeDisciplines.map((discipline) => (
            <article key={discipline.number} className="group flex flex-col">
              <div className="aspect-4/3 overflow-hidden rounded-2xl bg-[#eae5dc]">
                <img
                  src={discipline.previewImage}
                  alt={discipline.vietnameseTitle}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-5 flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-semibold tracking-tight text-[#1a1918]">
                    {discipline.vietnameseTitle}
                  </h3>
                  <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-(--accent-bronze) transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <p className="mt-2.5 flex-1 text-sm leading-relaxed text-[#625f5a]">
                  {discipline.description}
                </p>
                <div className="mt-auto flex items-center justify-between border-t border-black/8 pt-4 text-xs">
                  <span className="text-[#625f5a]">{discipline.metricLabel}</span>
                  <span className="font-semibold text-[#1a1918]">
                    {discipline.metricValue}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DisciplinesSection;
