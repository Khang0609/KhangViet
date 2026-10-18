"use client";

import { useState, useEffect, useCallback } from "react";

interface UseNavigationOptions {
  onOpenProfile?: () => void;
}

export function useNavigation({ onOpenProfile }: UseNavigationOptions = {}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);

  // Khóa cuộn trang khi menu mobile mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Bấm ESC để đóng menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) close();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  // Handler khi click vào link: vừa đóng menu vừa scroll
  const handleItemClick = useCallback(() => {
    close();
  }, [close]);

  // Handler khi click mở hồ sơ năng lực từ mobile menu
  const handleProfileClick = useCallback(() => {
    close();
    onOpenProfile?.();
  }, [close, onOpenProfile]);

  return {
    isOpen,
    toggle,
    close,
    handleItemClick,
    handleProfileClick,
  };
}
