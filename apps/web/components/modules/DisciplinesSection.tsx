import React from "react";
import { ArrowUpRight } from "lucide-react";
import type { CoreDiscipline } from "@khangviet/types";
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
    <section id="linh-vuc" className="scroll-mt-20 py-24 md:py-32">
      <div className="mx-auto max-w-360 px-5 md:px-8 xl:px-12">
        <SectionHeading
          index="01"
          eyebrow="Core disciplines"
          title="Ba trụ cột. Một tiêu chuẩn hoàn thiện."
          description="Từ kiến trúc mặt dựng quy mô lớn đến từng chi tiết trưng bày — mọi hạng mục được kiểm soát xuyên suốt bởi cùng một đội ngũ."
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {activeDisciplines.map((discipline) => (
            <article
              key={discipline.number}
              className="group flex flex-col border border-white/8 bg-(--bg-surface) transition-all duration-500 hover:-translate-y-1 hover:border-(--accent-bronze)/60"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={discipline.previewImage}
                  alt={discipline.vietnameseTitle}
                  className="h-full w-full object-cover grayscale-35 transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-linear-to-t from-(--bg-surface) via-transparent to-transparent" />
                <span className="font-mono-tech absolute top-5 left-5 border border-white/15 bg-black/60 px-2.5 py-1 text-[9px] tracking-widest text-(--accent-bronze)">
                  {discipline.code}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6 md:p-8">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <div className="font-syne text-4xl font-bold text-white/10">
                      {discipline.number}
                    </div>
                    <h3 className="font-syne -mt-2 text-xl font-bold">
                      {discipline.title}
                    </h3>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-(--accent-bronze)" />
                </div>
                <p className="text-sm leading-relaxed font-semibold">
                  {discipline.vietnameseTitle}
                </p>
                <p className="mt-3 text-xs leading-6 text-(--text-secondary)">
                  {discipline.description}
                </p>
                <ul className="mt-6 space-y-2 border-t border-white/8 pt-5">
                  {discipline.specs.slice(0, 3).map((spec) => (
                    <li
                      key={spec}
                      className="flex items-start gap-2 text-[11px] leading-5 text-white/70"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 bg-(--accent-bronze)" />
                      {spec}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex items-end justify-between border-t border-white/8 pt-6">
                  <span className="max-w-32 text-[10px] tracking-wider text-(--text-secondary) uppercase">
                    {discipline.metricLabel}
                  </span>
                  <span className="font-mono-tech text-sm text-(--accent-bronze)">
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
