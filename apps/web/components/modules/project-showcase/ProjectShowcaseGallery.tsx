"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import type { FeaturedProject } from "@khangviet/types";
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
    <div className={`lg:col-span-7 ${projectIndex % 2 ? "lg:order-2" : ""}`}>
      <button
        type="button"
        onClick={() => openProjectModal(project, 0)}
        className="group relative block aspect-16/10 w-full cursor-pointer overflow-hidden rounded-2xl bg-[#eae5dc] text-left"
      >
        <img
          src={project.coverImage}
          alt={project.title}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
        />
        <span className="absolute right-4 bottom-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#f4f1ea]/95 text-[#1a1918] opacity-0 shadow-md transition-all duration-300 group-hover:opacity-100">
          <ArrowUpRight className="h-5 w-5" />
        </span>
      </button>

      <div className="mt-3 grid grid-cols-3 gap-3">
        {project.gallery.slice(0, 3).map((image, imageIndex) => (
          <button
            type="button"
            key={image.id}
            onClick={() => openProjectModal(project, imageIndex)}
            className="group relative aspect-4/3 cursor-pointer overflow-hidden rounded-xl bg-[#eae5dc]"
          >
            <img
              src={image.src}
              alt={image.caption}
              className="h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProjectShowcaseGallery;
