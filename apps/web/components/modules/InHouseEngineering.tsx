"use client";

import React from "react";
import { DraftingCompass, MapPin, ShieldCheck } from "lucide-react";
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
      className="scroll-mt-20 bg-[#f4f1ea] py-20 text-[#1a1918] md:py-28"
    >
      <div className="mx-auto max-w-360 px-5 md:px-8 xl:px-12">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading
              orientation="vertical"
              eyebrow="Năng lực xưởng sản xuất"
              title="Tự chủ từ xưởng. Làm chủ công trình."
              description="Không qua trung gian. Mỗi đường hàn, mã màu và điểm sáng đều được kiểm soát ngay tại xưởng Khang Việt."
            />
            <div className="mt-8 rounded-2xl border border-black/10 bg-white p-6">
              <MapPin className="h-5 w-5 text-(--accent-bronze)" />
              <p className="mt-3 text-xs font-medium tracking-wider text-[#625f5a] uppercase">
                Tổ hợp xưởng sản xuất
              </p>
              <p className="mt-2 text-sm leading-6 font-medium text-[#1a1918]">
                {activeLegal.factoryAddress}
              </p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="rounded-2xl border border-black/10 bg-white p-6 md:p-8">
              <div className="flex flex-col justify-between gap-4 border-b border-black/8 pb-6 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-(--accent-bronze) text-white">
                    <DraftingCompass className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-(--accent-bronze)">
                      Ban Giám Đốc • Kỹ sư Kết cấu • Kiến trúc sư
                    </div>
                    <div className="mt-0.5 text-sm text-[#625f5a]">
                      Kiểm soát chất lượng xuyên suốt QA / QC / HSE
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-[#625f5a]">
                  <ShieldCheck className="h-4 w-4 text-(--accent-bronze)" />
                  <span>{totalHeadcount} nhân sự trực tiếp</span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {activeDivisions.map((division, index) => (
                  <ProductionDivisionCard
                    key={division.code}
                    division={division}
                    index={index}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
              <div className="text-xs font-medium tracking-wider text-(--accent-bronze) uppercase">
                Cam kết vận hành
              </div>
              <blockquote className="mt-2 text-lg font-medium text-[#1a1918]">
                “{activeLegal.commitment}”
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InHouseEngineering;
