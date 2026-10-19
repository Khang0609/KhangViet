import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProjectGalleryItem } from "@/data/khangVietData";

export interface ProjectGalleryViewerProps {
  gallery: ProjectGalleryItem[];
  activeIndex: number;
  onSelectIndex: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const ProjectGalleryViewer: React.FC<ProjectGalleryViewerProps> = ({
  gallery,
  activeIndex,
  onSelectIndex,
  onNext,
  onPrev,
}) => {
  const currentItem = gallery[activeIndex] || gallery[0];
  if (!currentItem) return null;

  return (
    <div className="relative flex flex-col justify-between border-b border-white/8 bg-[#0C0D0F] lg:w-7/12 lg:border-r lg:border-b-0">
      <div className="relative flex min-h-70 flex-1 items-center justify-center overflow-hidden p-4 sm:min-h-105 sm:p-8">
        <img
          src={currentItem.src}
          alt={currentItem.caption}
          className="max-h-[56vh] w-auto border border-white/10 object-contain shadow-2xl"
        />

        <button
          type="button"
          onClick={onPrev}
          className="absolute top-1/2 left-3 -translate-y-1/2 cursor-pointer border border-white/15 bg-(--bg-obsidian)/85 p-2.5 text-(--text-primary) transition-colors hover:bg-(--accent-bronze) hover:text-(--bg-obsidian)"
          aria-label="Ảnh trước"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onNext}
          className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer border border-white/15 bg-(--bg-obsidian)/85 p-2.5 text-(--text-primary) transition-colors hover:bg-(--accent-bronze) hover:text-(--bg-obsidian)"
          aria-label="Ảnh tiếp theo"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="font-mono-tech absolute top-4 left-4 border border-white/10 bg-(--bg-obsidian)/90 px-3 py-1 text-[11px] tracking-widest text-(--accent-bronze)">
          FRAME 0{activeIndex + 1} / 0{gallery.length}
        </div>
      </div>

      <div className="space-y-4 border-t border-white/8 bg-(--bg-obsidian) p-5">
        <div>
          <div className="font-mono-tech text-[11px] tracking-wider text-(--accent-bronze) uppercase">
            {currentItem.location} — {currentItem.spec}
          </div>
          <p className="mt-1 text-sm font-medium text-(--text-primary)">
            {currentItem.caption}
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {gallery.map((item, idx) => (
            <button
              type="button"
              key={item.id}
              onClick={() => onSelectIndex(idx)}
              className={`relative h-14 w-20 shrink-0 cursor-pointer overflow-hidden border transition-all ${
                idx === activeIndex
                  ? "border-(--accent-bronze) ring-1 ring-(--accent-bronze)"
                  : "border-white/10 opacity-50 hover:opacity-90"
              }`}
              aria-label={`Xem ảnh ${idx + 1}`}
            >
              <img
                src={item.src}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectGalleryViewer;
