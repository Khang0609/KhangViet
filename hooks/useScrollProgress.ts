"use client";

import { useEffect, type RefObject } from "react";

/**
 * Updates `--scroll-delta` (in px) directly on `ref.current` via rAF on scroll
 * without triggering React re-renders, keeping scroll-linked motion at 60fps.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  travelPx = 280,
): void {
  useEffect(() => {
    let rafId = 0;

    const update = () => {
      rafId = 0;
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const total = window.innerHeight + rect.height;
      if (total <= 0) return;

      const raw = (window.innerHeight - rect.top) / total;
      const clamped = Math.max(0, Math.min(1, raw));
      const delta = (clamped - 0.5) * travelPx;
      el.style.setProperty("--scroll-delta", `${delta.toFixed(2)}px`);
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref, travelPx]);
}
