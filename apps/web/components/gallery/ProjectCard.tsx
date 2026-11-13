"use client";

import React from "react";
import { MapPin } from "lucide-react";
import type { GalleryProject } from "@khangviet/types";

interface ProjectCardProps {
  project: GalleryProject;
  onSelect: (project: GalleryProject) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onSelect,
}) => {
  const isTender3D = project.stage === "TENDER_3D";
  const displayImg = isTender3D
    ? project.img3D || project.imgActual
    : project.imgActual;

  return (
    <article
      onClick={() => onSelect(project)}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/8 bg-(--bg-surface) transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/50 hover:bg-(--bg-surface-elevated)"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-zinc-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayImg}
          alt={project.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {isTender3D && (
          <div className="blueprint-grid-orange pointer-events-none absolute inset-0" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase backdrop-blur-xs ${
              isTender3D
                ? "bg-brand/90 text-white"
                : "bg-emerald-500/90 text-white"
            }`}
          >
            {isTender3D ? "2D/3D Trúng thầu" : "Thực tế nghiệm thu"}
          </span>
          <span className="rounded-md border border-white/15 bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-zinc-200 backdrop-blur-xs">
            {project.segment === "B2B" ? "Chuỗi B2B" : "Khách lẻ C2B"}
          </span>
        </div>

        <div className="absolute right-3 bottom-2.5 left-3 flex items-center justify-between text-[11px] text-zinc-200">
          <span className="truncate font-medium">{project.category}</span>
          <span className="shrink-0 font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100">
            Xem hồ sơ →
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="truncate text-[11px] font-bold tracking-wider text-brand uppercase">
            {project.client}
          </div>
          <h3 className="mt-1 line-clamp-2 text-sm leading-snug font-bold text-white transition-colors group-hover:text-brand">
            {project.title}
          </h3>
        </div>

        <div className="mt-3 space-y-1.5 border-t border-white/8 pt-3 text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
            <span className="truncate">{project.location}</span>
          </div>
          <div className="truncate text-zinc-500">{project.material}</div>
        </div>
      </div>
    </article>
  );
};

export default ProjectCard;
