"use client";

import React from "react";
import { Calendar } from "lucide-react";
import type { GalleryProject } from "@khangviet/types";
import { getProjectCoverUrl } from "@/lib/galleryClusters";

interface ProjectCardProps {
  project: GalleryProject;
  onSelect: (project: GalleryProject) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onSelect,
}) => {
  const displayImg = getProjectCoverUrl(project);
  const serviceLabel = project.services.map((s) => s.name).join(" • ");

  return (
    <article
      onClick={() => onSelect(project)}
      className="group flex cursor-pointer flex-col"
    >
      <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-[#eae5dc]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayImg}
          alt={project.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className="mt-3.5 flex flex-1 flex-col">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="truncate font-medium text-(--accent-bronze)">
            {project.organization?.name || "Khách hàng Khang Việt"}
          </span>
          {serviceLabel && (
            <span className="shrink-0 truncate text-[#625f5a]">
              {serviceLabel}
            </span>
          )}
        </div>
        <h3 className="mt-1 line-clamp-2 text-base leading-snug font-semibold text-[#1a1918] transition-colors group-hover:text-(--accent-bronze)">
          {project.title}
        </h3>
        {project.year && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#625f5a]">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{project.year}</span>
          </div>
        )}
      </div>
    </article>
  );
};

export default ProjectCard;
