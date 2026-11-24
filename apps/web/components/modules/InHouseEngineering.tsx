"use client";

import React from "react";
import { MapPin, ShieldCheck } from "lucide-react";
import type { CompanyLegalInfo, ProductionDivision } from "@khangviet/types";
import {
  useLegalInfo,
  useProductionDivisions,
} from "@/components/contexts/LandingContext";
import { SectionHeading } from "../ui/SectionHeading";
import { ProductionDivisionCard } from "./ProductionDivisionCard";

export interface InHouseEngineeringProps {
  divisions?: ProductionDivision[];
  legalInfo?: CompanyLegalInfo;
}

export const InHouseEngineering: React.FC<InHouseEngineeringProps> = ({
  divisions,
  legalInfo,
}) => {
  const contextDivisions = useProductionDivisions();
  const contextLegal = useLegalInfo();

  const activeDivisions =
    divisions && divisions.length > 0 ? divisions : contextDivisions;
  const activeLegal = legalInfo || contextLegal;

  const totalHeadcount =
    activeDivisions.reduce((sum, div) => {
      const num = parseInt(div.headcount || "0", 10);
      return sum + (Number.isNaN(num) ? 0 : num);
    }, 0) || 24;

  return (
    <section
      id="nang-luc"
      className="scroll-mt-20 border-t border-black/8 bg-[#f4f1ea] py-20 text-[#1a1918] md:py-28"
    >
      <div className="mx-auto max-w-360 px-5 md:px-8 xl:px-12">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="flex flex-col justify-between lg:col-span-5">
            <div>
              <SectionHeading
                orientation="vertical"
                eyebrow="Năng lực xưởng sản xuất"
                title="Tự chủ từ xưởng. Làm chủ công trình."
                description="Không qua trung gian. Mỗi đường hàn, mã màu và điểm sáng đều được kiểm soát trực tiếp bởi đội ngũ Khang Việt."
              />

              <div className="mt-10 flex items-start gap-3.5 border-t border-black/10 pt-8">
                <span className="text-5xl leading-[0.82] font-semibold tracking-tight text-[#1a1918] tabular-nums">
                  {totalHeadcount}
                </span>
                <div>
                  <div className="text-sm leading-tight font-semibold text-[#1a1918]">
                    Nhân sự thi công trực tiếp
                  </div>
                  <div className="mt-1 text-xs text-[#625f5a]">
                    Kiểm soát chất lượng xuyên suốt QA / QC / HSE
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 space-y-6 border-t border-black/10 pt-8">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-(--accent-bronze)" />
                <div>
                  <div className="text-xs font-medium tracking-wider text-[#625f5a] uppercase">
                    Tổ hợp xưởng sản xuất
                  </div>
                  <p className="mt-1 text-sm leading-relaxed font-medium text-[#1a1918]">
                    {activeLegal.factoryAddress}
                  </p>
                </div>
              </div>

              <blockquote className="border-l-2 border-(--accent-bronze) pl-4 text-sm leading-relaxed text-[#625f5a]">
                “{activeLegal.commitment}”
              </blockquote>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-black/10 bg-white px-6 py-4 md:px-8 md:py-6">
              <div className="flex items-center justify-between border-b border-black/10 pb-4">
                <span className="text-xs font-medium tracking-wider text-[#625f5a] uppercase">
                  Cơ cấu 4 tổ chuyên môn
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1a1918]">
                  <ShieldCheck className="h-4 w-4 text-(--accent-bronze)" />
                  Gia công trực tiếp 100%
                </span>
              </div>

              <div className="divide-y divide-black/8">
                {activeDivisions.map((division, index) => (
                  <ProductionDivisionCard
                    key={division.id}
                    division={division}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InHouseEngineering;
