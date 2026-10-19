"use client";

import React from "react";
import { type FeaturedProject } from "@/data/khangVietData";
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
      className={`flex flex-col justify-between lg:col-span-4 ${projectIndex % 2 ? "lg:order-1" : ""}`}
    >
      <div>
        <div className="font-mono-tech text-[10px] tracking-[0.2em] text-(--accent-bronze) uppercase">
          {project.code}
        </div>
        <h3 className="font-syne mt-4 text-2xl leading-tight font-bold md:text-3xl">
          {project.title}
        </h3>
        <p className="mt-5 text-sm leading-7 text-(--text-secondary)">
          {project.summary}
        </p>
      </div>
      <div className="mt-8">
        <dl className="border-y border-white/8">
          <MetaRow label="Khách hàng" value={project.client} />
          <MetaRow label="Quy mô" value={project.scaleMetric} accent />
          <MetaRow label="Thời kỳ" value={project.year} />
          <MetaRow
            label="Vật liệu chính"
            value={project.materials.slice(0, 2).join(" • ")}
          />
        </dl>
        <button
          type="button"
          onClick={() => openProjectModal(project, 0)}
          className="group mt-6 flex w-full cursor-pointer items-center justify-between border border-(--border-bronze-subtle) px-5 py-4 text-xs font-semibold tracking-wider text-(--accent-bronze) uppercase transition-colors hover:bg-(--accent-bronze) hover:text-black"
        >
          Xem hồ sơ dự án
          <span className="font-mono-tech">
            0{project.gallery.length} frames
          </span>
        </button>
      </div>
    </div>
  );
};

export default ProjectShowcaseDetails;
