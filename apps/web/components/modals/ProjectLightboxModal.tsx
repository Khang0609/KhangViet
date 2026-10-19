import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { type FeaturedProject } from '@/data/khangVietData';
import { useCarousel } from '@/hooks/useCarousel';
import BaseModal from '../ui/BaseModal';
import { ProjectGalleryViewer } from './project-lightbox/ProjectGalleryViewer';
import { ProjectDossierInfo } from './project-lightbox/ProjectDossierInfo';

export interface ProjectLightboxModalProps {
  project: FeaturedProject | null;
  initialImageIndex?: number;
  onClose: () => void;
}

export const ProjectLightboxModal: React.FC<ProjectLightboxModalProps> = ({
  project,
  initialImageIndex = 0,
  onClose,
}) => {
  const galleryLength = project ? project.gallery.length : 0;
  const { currentIndex, setCurrentIndex, next, prev } = useCarousel(
    galleryLength,
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
      <div className="relative flex flex-col lg:flex-row overflow-hidden max-h-[92vh]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 bg-(--bg-obsidian)/90 text-(--text-primary) hover:text-(--accent-bronze) border border-white/15 transition-colors cursor-pointer"
          aria-label="Đóng chi tiết dự án"
        >
          <X className="w-5 h-5" />
        </button>

        <ProjectGalleryViewer
          gallery={project.gallery}
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
