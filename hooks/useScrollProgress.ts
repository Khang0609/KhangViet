"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Returns a normalized scroll progress in [0, 1] as `ref` moves from
 * entering the bottom of the viewport (0) to leaving the top (1).
 * At 0.5 the element is centered in the viewport.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>): number {
  const [progress, setProgress] = useState(0.5);

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
      setProgress(clamped);
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
  }, [ref]);

  return progress;
}
