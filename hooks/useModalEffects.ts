"use client";

import { useEffect } from "react";

export function useSyncIndex(
  depKey: unknown,
  targetIndex: number,
  setIndex: (index: number) => void,
) {
  useEffect(() => {
    setIndex(targetIndex);
  }, [depKey, targetIndex, setIndex]);
}

export function useModalBodyLock(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);
}
