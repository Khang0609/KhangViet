"use client";

import React from "react";
import type { Organization } from "@khangviet/types";

interface KeyAccountsSpotlightProps {
  organizations: Organization[];
  selectedOrganizationId: string;
  onSelectOrganization: (organizationId: string) => void;
}

export const KeyAccountsSpotlight: React.FC<KeyAccountsSpotlightProps> = ({
  organizations,
  selectedOrganizationId,
  onSelectOrganization,
}) => {
  const activeOrg =
    selectedOrganizationId !== "ALL"
      ? organizations.find((o) => o.id === selectedOrganizationId)
      : undefined;

  return (
    <section className="border-b border-black/8 bg-[#eae5dc]/45 py-6">
      <div className="mx-auto max-w-360 px-5 md:px-8 xl:px-12">
        <div className="mb-3.5 flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-baseline gap-2">
            <h2 className="text-xs font-semibold tracking-wider text-[#1a1918] uppercase">
              Đối tác chiến lược
            </h2>
            <span className="text-xs text-[#625f5a]">
              — Chọn thương hiệu để lọc nhanh chuỗi dự án
            </span>
          </div>
          {selectedOrganizationId !== "ALL" && (
            <button
              type="button"
              onClick={() => onSelectOrganization("ALL")}
              className="shrink-0 cursor-pointer text-xs font-medium text-(--accent-bronze) hover:underline"
            >
              × Bỏ chọn
            </button>
          )}
        </div>

        <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1 lg:grid lg:grid-cols-6">
          {organizations.map((org) => {
            const isActive = selectedOrganizationId === org.id;
            return (
              <button
                key={org.id}
                type="button"
                onClick={() =>
                  onSelectOrganization(isActive ? "ALL" : org.id)
                }
                className={`min-w-42 shrink-0 cursor-pointer rounded-xl border px-4 py-3 text-left transition-all lg:min-w-0 ${
                  isActive
                    ? "border-[#1a1918] bg-[#1a1918] text-white"
                    : "border-black/10 bg-white text-[#1a1918] hover:border-black/25"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-semibold">
                    {org.name}
                  </span>
                  {isActive && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-(--accent-bronze)" />
                  )}
                </div>
                {org.description && (
                  <div
                    className={`mt-0.5 truncate text-[11px] ${
                      isActive ? "text-white/70" : "text-[#625f5a]"
                    }`}
                  >
                    {org.description}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {activeOrg && (
          <div className="mt-3.5 flex flex-col items-start justify-between gap-4 rounded-xl border border-black/10 bg-white p-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded border border-(--accent-bronze)/30 bg-(--accent-bronze)/15 px-2 py-0.5 text-[10px] font-bold text-(--accent-bronze) uppercase">
                  Đối tác thương hiệu
                </span>
                <h3 className="text-sm font-bold text-[#1a1918]">
                  {activeOrg.name}
                </h3>
              </div>
              {activeOrg.description && (
                <p className="mt-1.5 text-xs leading-relaxed text-[#625f5a]">
                  {activeOrg.description}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default KeyAccountsSpotlight;
