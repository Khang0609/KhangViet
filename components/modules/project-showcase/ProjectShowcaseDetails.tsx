"use client";

import React from "react";
import type { Project } from "@/types/landing";
import MetaRow from "../../ui/MetaRow";
import { useModalContext } from "../../modals/modalContext";

export interface ProjectShowcaseDetailsProps {
  project: Project;
  projectIndex: number;
}

export const ProjectShowcaseDetails: React.FC<ProjectShowcaseDetailsProps> = ({
  project,
  projectIndex,
}) => {
  const { openProjectModal } = useModalContext();
  const serviceLabel =
    project.services?.map((s) => s.name).join(" • ") || "Thiết kế & Thi công";
  const mediaCount = project.media?.length ?? 0;

  return (
    <div
      className={`flex flex-col justify-between lg:col-span-5 ${projectIndex % 2 ? "lg:order-1" : ""}`}
    >
      <div>
        <div className="text-xs font-medium tracking-[0.12em] text-(--accent-bronze) uppercase">
          {serviceLabel}
        </div>
        <h3 className="mt-3 text-2xl leading-snug font-semibold tracking-tight text-[#1a1918] md:text-3xl">
          {project.title}
        </h3>
        {project.summary && (
          <p className="mt-4 text-sm leading-relaxed text-[#625f5a]">
            {project.summary}
          </p>
        )}
      </div>
      <div className="mt-8">
        <dl className="border-y border-black/8">
          <MetaRow
            label="Đối tác"
            value={project.organization?.name || "Khách hàng Khang Việt"}
          />
          <MetaRow label="Hạng mục" value={serviceLabel} accent />
          <MetaRow
            label="Năm thực hiện"
            value={project.year ? String(project.year) : "2025"}
          />
        </dl>
        <button
          type="button"
          onClick={() => openProjectModal(project, 0)}
          className="mt-6 flex w-full cursor-pointer items-center justify-between rounded-full border border-black/15 bg-[#f4f1ea]/60 px-6 py-3.5 text-sm font-medium text-[#1a1918] transition-colors hover:border-[#1a1918] hover:bg-[#1a1918] hover:text-white"
        >
          <span>Xem hồ sơ dự án</span>
          <span className="text-xs opacity-70">{mediaCount} ảnh</span>
        </button>
      </div>
    </div>
  );
};

export default ProjectShowcaseDetails;
