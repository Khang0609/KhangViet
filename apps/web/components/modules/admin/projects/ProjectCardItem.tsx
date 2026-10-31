import React from "react";
import { Edit2, Trash2, Calendar } from "lucide-react";
import type { FeaturedProject } from "@khangviet/types";

interface Props {
  project: FeaturedProject;
  onEdit: (p: FeaturedProject) => void;
  onDelete: (id: string) => void;
}

export const ProjectCardItem: React.FC<Props> = ({ project, onEdit, onDelete }) => {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-white/8 bg-white/2 transition-colors hover:border-(--accent-bronze)">
      <div className="relative aspect-16/9 w-full overflow-hidden bg-black/40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.coverImage || "/image/image-placeholder.png"}
          alt={project.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 left-2 rounded bg-black/70 px-2 py-0.5 font-mono-tech text-[10px] text-(--accent-bronze)">
          {project.code}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="mb-1 flex items-center justify-between text-[11px] text-white/40">
            <span className="font-mono-tech">{project.categoryTag}</span>
            <span className="flex items-center gap-1 font-mono-tech">
              <Calendar className="h-3 w-3" />
              {project.year}
            </span>
          </div>
          <h4 className="font-syne text-sm font-bold text-(--text-primary)">{project.title}</h4>
          <p className="mt-1 line-clamp-1 font-sans text-xs text-(--text-secondary)">
            Khách hàng: {project.client}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-white/6 pt-3">
          <span className="font-mono-tech text-[10px] text-white/40">
            {project.gallery?.length || 0} ảnh đính kèm
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(project)}
              className="flex items-center gap-1 rounded border border-white/10 px-2.5 py-1 font-mono-tech text-xs text-white/80 hover:border-(--accent-bronze) hover:text-white"
            >
              <Edit2 className="h-3 w-3" />
              <span>Sửa</span>
            </button>
            <button
              onClick={() => onDelete(project.id)}
              className="flex items-center gap-1 rounded border border-red-500/20 px-2.5 py-1 font-mono-tech text-xs text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCardItem;

