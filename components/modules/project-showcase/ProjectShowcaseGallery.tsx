"use client";

import React from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/types/landing";
import { useModalContext } from "../../modals/modalContext";

export interface ProjectShowcaseGalleryProps {
  project: Project;
  projectIndex: number;
}

export const ProjectShowcaseGallery: React.FC<ProjectShowcaseGalleryProps> = ({
  project,
  projectIndex,
}) => {
  const { openProjectModal } = useModalContext();
  const media = project.media ?? [];
  const cover =
    media.find((m) => m.isCover)?.storageKey ??
    media[0]?.storageKey ??
    "/images/placeholder-project.jpg";

  return (
    <div className={`lg:col-span-7 ${projectIndex % 2 ? "lg:order-2" : ""}`}>
      <button
        type="button"
        onClick={() => openProjectModal(project, 0)}
        className="group relative block aspect-16/10 w-full cursor-pointer overflow-hidden rounded-2xl bg-[#eae5dc] text-left"
      >
        <Image
          src={cover}
          alt={project.title}
          fill
          sizes="(max-width: 1024px) 100vw, 58vw"
          className="object-cover transition duration-700 group-hover:scale-[1.025]"
        />
        <span className="absolute right-4 bottom-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#f4f1ea]/95 text-[#1a1918] opacity-0 shadow-md transition-all duration-300 group-hover:opacity-100">
          <ArrowUpRight className="h-5 w-5" />
        </span>
      </button>

      <div className="mt-3 grid grid-cols-3 gap-3">
        {media.slice(0, 3).map((image, imageIndex) => (
          <button
            type="button"
            key={image.id}
            onClick={() => openProjectModal(project, imageIndex)}
            className="group relative aspect-4/3 cursor-pointer overflow-hidden rounded-xl bg-[#eae5dc]"
          >
            <Image
              src={image.storageKey}
              alt={image.caption || image.altText || project.title}
              fill
              sizes="(max-width: 1024px) 33vw, 20vw"
              className="object-cover opacity-85 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProjectShowcaseGallery;
