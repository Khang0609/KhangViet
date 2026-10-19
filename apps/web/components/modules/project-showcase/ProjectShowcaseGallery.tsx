"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import { type FeaturedProject } from "./type";
import { useModalContext } from "../../modals/modalContext";

export interface ProjectShowcaseGalleryProps {
  project: FeaturedProject;
  projectIndex: number;
}

export const ProjectShowcaseGallery: React.FC<ProjectShowcaseGalleryProps> = ({
  project,
  projectIndex,
}) => {
  const { openProjectModal } = useModalContext();

  return (
    <div className={`lg:col-span-8 ${projectIndex % 2 ? "lg:order-2" : ""}`}>
      <button
        type="button"
        onClick={() => openProjectModal(project, 0)}
        className="group relative block aspect-16/10 w-full cursor-pointer overflow-hidden bg-(--bg-surface) text-left"
      >
        <img
          src={project.coverImage}
          alt={project.title}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/75 via-transparent to-black/15" />
        <span className="absolute right-5 bottom-5 flex h-12 w-12 items-center justify-center border border-white/30 bg-black/50 backdrop-blur transition-colors group-hover:border-(--accent-bronze) group-hover:bg-(--accent-bronze) group-hover:text-black">
          <ArrowUpRight className="h-5 w-5" />
        </span>
        <span className="font-mono-tech absolute top-5 left-5 bg-(--accent-bronze) px-3 py-1.5 text-[9px] font-semibold tracking-widest text-black uppercase">
          Featured 0{projectIndex + 1}
        </span>
      </button>

      <div className="mt-3 grid grid-cols-3 gap-3">
        {project.gallery.slice(0, 3).map((image, imageIndex) => (
          <button
            type="button"
            key={image.id}
            onClick={() => openProjectModal(project, imageIndex)}
            className="group relative aspect-4/3 cursor-pointer overflow-hidden border border-white/8"
          >
            <img
              src={image.src}
              alt={image.caption}
              className="h-full w-full object-cover opacity-60 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProjectShowcaseGallery;
