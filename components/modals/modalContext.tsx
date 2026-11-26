"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import type { Project } from "@/types/landing";

export type ProfileModalType = "profile" | "wireframe" | null;

interface ModalContextValue {
  profileModal: ProfileModalType;
  openProfileModal: (tab: "profile" | "wireframe") => void;
  closeProfileModal: () => void;
  activeProject: Project | null;
  activeImageIndex: number;
  openProjectModal: (project: Project, imageIdx?: number) => void;
  closeProjectModal: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [profileModal, setProfileModal] = useState<ProfileModalType>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const openProfileModal = (tab: "profile" | "wireframe") =>
    setProfileModal(tab);
  const closeProfileModal = () => setProfileModal(null);

  const openProjectModal = (project: Project, imageIdx = 0) => {
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

export function useOptionalModalContext(): ModalContextValue | null {
  return useContext(ModalContext);
}

export function useModalContext(): ModalContextValue {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModalContext must be used within a ModalProvider");
  }
  return context;
}
