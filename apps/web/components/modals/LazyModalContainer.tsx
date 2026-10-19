"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { useModalContext } from './modalContext';

const ProjectLightboxModal = dynamic(
  () => import('./ProjectLightboxModal'),
  { ssr: false }
);

const SpecAndProfileModal = dynamic(
  () => import('./SpecAndProfileModal'),
  { ssr: false }
);

export const LazyModalContainer: React.FC = () => {
  const {
    activeProject,
    activeImageIndex,
    closeProjectModal,
    profileModal,
    closeProfileModal,
  } = useModalContext();

  return (
    <>
      {activeProject && (
        <ProjectLightboxModal
          project={activeProject}
          initialImageIndex={activeImageIndex}
          onClose={closeProjectModal}
        />
      )}

      {Boolean(profileModal) && (
        <SpecAndProfileModal
          isOpen={Boolean(profileModal)}
          initialTab={profileModal ?? 'profile'}
          onClose={closeProfileModal}
        />
      )}
    </>
  );
};

export default LazyModalContainer;

