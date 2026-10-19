"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { type FeaturedProject } from '@/data/khangVietData';

export type ProfileModalType = 'profile' | 'wireframe' | null;

interface ModalContextValue {
  profileModal: ProfileModalType;
  openProfileModal: (tab: 'profile' | 'wireframe') => void;
  closeProfileModal: () => void;
  activeProject: FeaturedProject | null;
  activeImageIndex: number;
  openProjectModal: (project: FeaturedProject, imageIdx?: number) => void;
  closeProjectModal: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profileModal, setProfileModal] = useState<ProfileModalType>(null);
  const [activeProject, setActiveProject] = useState<FeaturedProject | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const openProfileModal = (tab: 'profile' | 'wireframe') => setProfileModal(tab);
  const closeProfileModal = () => setProfileModal(null);

  const openProjectModal = (project: FeaturedProject, imageIdx = 0) => {
    setActiveImageIndex(imageIdx);
    setActiveProject(project);
  };
  const closeProjectModal = () => setActiveProject(null);

  return (
    <ModalContext.Provider
      value={{
        profileModal,
        openProfileModal,
        closeProfileModal,
        activeProject,
        activeImageIndex,
        openProjectModal,
        closeProjectModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export function useModalContext(): ModalContextValue {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModalContext must be used within a ModalProvider');
  }
  return context;
}

