import React from "react";
import { DraftingCompass, MapPin, ShieldCheck } from "lucide-react";
import type { CompanyLegalInfo, ProductionDivision } from "@khangviet/types";
import { COMPANY_LEGAL_INFO, PRODUCTION_DIVISIONS } from "@/data/khangVietData";
import { SectionHeading } from "../ui/SectionHeading";
import { ProductionDivisionCard } from "./ProductionDivisionCard";

export interface InHouseEngineeringProps {
  divisions?: ProductionDivision[];
  legalInfo?: CompanyLegalInfo;
}

export const InHouseEngineering: React.FC<InHouseEngineeringProps> = ({
  divisions = PRODUCTION_DIVISIONS,
  legalInfo = COMPANY_LEGAL_INFO,
}) => {
  const activeDivisions = divisions && divisions.length > 0 ? divisions : PRODUCTION_DIVISIONS;
  const activeLegal = legalInfo || COMPANY_LEGAL_INFO;

  return (
    <section id="nang-luc" className="bg-blueprint-grid scroll-mt-20 py-24 md:py-32">
      <div className="mx-auto max-w-360 px-5 md:px-8 xl:px-12">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading
              orientation="vertical"
              index="03"
              eyebrow="In-house engineering"
              title="Tự chủ từ xưởng. Làm chủ công trình."
              description="Không qua trung gian. Mỗi đường hàn, mã màu và điểm sáng đều được kiểm soát ngay tại xưởng Khang Việt."
            />
            <div className="mt-8 border border-(--border-bronze-subtle) bg-(--accent-bronze)/6 p-5">
              <MapPin className="h-5 w-5 text-(--accent-bronze)" />
              <p className="mt-3 text-xs tracking-wider text-(--text-secondary) uppercase">
                Tổ hợp xưởng sản xuất
              </p>
              <p className="mt-2 text-sm leading-6 font-semibold">
                {activeLegal.factoryAddress}
              </p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="border border-white/8 bg-(--bg-surface) p-5 md:p-8">
              <div className="grid items-center gap-4 border border-(--border-bronze-subtle) bg-[#15171a] p-5 sm:grid-cols-[auto_1fr_auto]">
                <div className="flex h-12 w-12 items-center justify-center bg-(--accent-bronze) text-black">
                  <DraftingCompass className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-mono-tech text-[9px] tracking-widest text-(--accent-bronze) uppercase">
                    Command & engineering
                  </div>
                  <div className="font-syne mt-1 text-lg font-bold">
                    Ban Giám Đốc • Kỹ sư Kết cấu • Kiến trúc sư
                  </div>
                </div>
                <div className="font-mono-tech text-[10px] text-(--text-secondary)">
                  QA / QC / HSE
                </div>
              </div>

              <div className="mx-auto h-8 w-px bg-(--accent-bronze)/50" />

              <div className="grid gap-3 sm:grid-cols-2">
                {activeDivisions.map((division, index) => (
                  <ProductionDivisionCard
                    key={division.code}
                    division={division}
                    index={index}
                  />
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-col justify-between gap-5 border-l-2 border-(--accent-bronze) bg-white/2.5 p-6 sm:flex-row sm:items-center">
              <div>
                <div className="font-mono-tech text-[9px] tracking-[0.2em] text-(--accent-bronze) uppercase">
                  Cam kết vận hành
                </div>
                <blockquote className="font-syne mt-2 text-lg font-bold">
                  “{activeLegal.commitment}”
                </blockquote>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-(--accent-bronze)" />
                <span className="font-mono-tech text-[10px] tracking-wider text-(--text-secondary) uppercase">
                  24 nhân sự
                  <br />
                  trực tiếp biên chế
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InHouseEngineering;
