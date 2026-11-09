"use client";

import React from "react";
import { Building2, ShieldCheck } from "lucide-react";
import {
  useLegalInfo,
  useProductionDivisions,
} from "@/components/contexts/LandingContext";

export const LegalAndFactorySection: React.FC = () => {
  const legal = useLegalInfo();
  const divisions = useProductionDivisions();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-4 border border-white/8 bg-(--bg-obsidian) p-6">
        <div className="font-mono-tech flex items-center gap-2 text-xs tracking-widest text-(--accent-bronze) uppercase">
          <Building2 className="h-4 w-4" /> 01. Thông Tin Pháp Lý Doanh Nghiệp
        </div>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-white/5 py-2">
            <dt className="text-(--text-secondary)">Tên viết tắt:</dt>
            <dd className="font-medium text-(--text-primary)">
              {legal.shortName}
            </dd>
          </div>
          <div className="flex justify-between border-b border-white/5 py-2">
            <dt className="text-(--text-secondary)">Mã số thuế / GPKD:</dt>
            <dd className="font-mono-tech font-semibold text-(--accent-bronze)">
              {legal.taxId}
            </dd>
          </div>
          <div className="flex justify-between border-b border-white/5 py-2">
            <dt className="text-(--text-secondary)">Ngày cấp phép:</dt>
            <dd className="text-(--text-primary)">
              {legal.licenseDate} ({legal.licenseIssuer || "Sở KH&ĐT TP.HCM"})
            </dd>
          </div>
          <div className="flex justify-between border-b border-white/5 py-2">
            <dt className="text-(--text-secondary)">Đại diện pháp luật:</dt>
            <dd className="font-semibold text-(--text-primary)">
              Ông {legal.director} — Giám Đốc
            </dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-(--text-secondary)">Hotline điều hành:</dt>
            <dd className="font-mono-tech text-(--accent-bronze)">
              {legal.hotline}
            </dd>
          </div>
        </dl>
      </div>

      <div className="space-y-4 border border-white/8 bg-(--bg-obsidian) p-6">
        <div className="font-mono-tech flex items-center gap-2 text-xs tracking-widest text-(--accent-bronze) uppercase">
          <ShieldCheck className="h-4 w-4" /> 02. Tổ Hợp Xưởng Sản Xuất Trực
          Tiếp
        </div>
        <p className="text-sm leading-relaxed text-(--text-primary)">
          Địa chỉ nhà xưởng:{" "}
          <span className="font-medium text-(--accent-bronze)">
            {legal.factoryAddress}
          </span>
        </p>
        <div className="grid grid-cols-2 gap-3 pt-2">
          {divisions.map((div) => (
            <div
              key={div.code}
              className="border border-white/6 bg-(--bg-surface) p-3"
            >
              <div className="font-syne text-xl font-bold text-(--accent-bronze)">
                {div.headcount}{" "}
                <span className="font-sans text-xs font-normal text-(--text-secondary)">
                  nhân sự
                </span>
              </div>
              <div className="mt-0.5 text-xs font-medium text-(--text-primary)">
                {div.name}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-white/6 pt-1 text-xs text-(--text-secondary)">
          Chỉ huy trực tiếp bởi đội ngũ Kỹ sư Kết cấu & Kiến trúc sư giàu kinh
          nghiệm thực chiến.
        </div>
      </div>
    </div>
  );
};

export default LegalAndFactorySection;
