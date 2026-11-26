import React, { useEffect } from "react";
import { X } from "lucide-react";
import type { Project } from "@khangviet/types";
import { useCarousel } from "@/hooks/useCarousel";
import BaseModal from "../ui/BaseModal";
import { ProjectGalleryViewer } from "./project-lightbox/ProjectGalleryViewer";
import { ProjectDossierInfo } from "./project-lightbox/ProjectDossierInfo";

export interface ProjectLightboxModalProps {
  project: Project | null;
  initialImageIndex?: number;
  onClose: () => void;
}

export const ProjectLightboxModal: React.FC<ProjectLightboxModalProps> = ({
  project,
  initialImageIndex = 0,
  onClose,
}) => {
  const media = project?.media ?? [];
  const { currentIndex, setCurrentIndex, next, prev } = useCarousel(
    media.length,
    undefined,
    initialImageIndex
  );

  useEffect(() => {
    setCurrentIndex(initialImageIndex);
  }, [initialImageIndex, project, setCurrentIndex]);

  if (!project) return null;

  return (
    <BaseModal
      isOpen={Boolean(project)}
      onClose={onClose}
      maxWidth="max-w-6xl"
      ariaLabel={`Chi tiết dự án: ${project.title}`}
    >
      <div className="relative flex max-h-[92vh] flex-col overflow-hidden lg:flex-row">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 cursor-pointer rounded-full border border-black/10 bg-white/90 p-2 text-[#1a1918] shadow-sm transition-colors hover:bg-[#1a1918] hover:text-white"
          aria-label="Đóng chi tiết dự án"
        >
          <X className="h-5 w-5" />
        </button>

        <ProjectGalleryViewer
          gallery={media}
          activeIndex={currentIndex}
          onSelectIndex={setCurrentIndex}
          onNext={next}
          onPrev={prev}
        />

        <ProjectDossierInfo project={project} onClose={onClose} />
      </div>
    </BaseModal>
  );
};

export default ProjectLightboxModal;
