"use client";

import React from "react";
import type { FeaturedProject } from "@khangviet/types";
import MetaRow from "../../ui/MetaRow";
import { useModalContext } from "../../modals/modalContext";

export interface ProjectShowcaseDetailsProps {
  project: FeaturedProject;
  projectIndex: number;
}

export const ProjectShowcaseDetails: React.FC<ProjectShowcaseDetailsProps> = ({
  project,
  projectIndex,
}) => {
  const { openProjectModal } = useModalContext();

  return (
    <div
      className={`flex flex-col justify-between lg:col-span-5 ${projectIndex % 2 ? "lg:order-1" : ""}`}
    >
      <div>
        <div className="text-xs font-medium tracking-[0.12em] text-(--accent-bronze) uppercase">
          {project.categoryTag || project.code}
        </div>
        <h3 className="mt-3 text-2xl leading-snug font-semibold tracking-tight text-[#1a1918] md:text-3xl">
          {project.title}
        </h3>
        <p className="mt-4 text-sm leading-relaxed text-[#625f5a]">
          {project.summary}
        </p>
      </div>
      <div className="mt-8">
        <dl className="border-y border-black/8">
          <MetaRow label="Khách hàng" value={project.client} />
          <MetaRow label="Quy mô" value={project.scaleMetric} accent />
          <MetaRow label="Thời kỳ" value={project.year} />
          <MetaRow
            label="Vật liệu"
            value={project.materials.slice(0, 2).join(" • ")}
          />
        </dl>
        <button
          type="button"
          onClick={() => openProjectModal(project, 0)}
          className="mt-6 flex w-full cursor-pointer items-center justify-between rounded-full border border-black/15 bg-[#f4f1ea]/60 px-6 py-3.5 text-sm font-medium text-[#1a1918] transition-colors hover:border-[#1a1918] hover:bg-[#1a1918] hover:text-white"
        >
          <span>Xem hồ sơ dự án</span>
          <span className="text-xs opacity-70">
            {project.gallery.length} ảnh
          </span>
        </button>
      </div>
    </div>
  );
};

export default ProjectShowcaseDetails;
