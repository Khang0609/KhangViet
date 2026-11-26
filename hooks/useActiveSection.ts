"use client";

import { useEffect, useState, type MouseEvent } from "react";

const SECTION_IDS = ["top", "du-an", "contact-gate"] as const;
const SCROLL_VELOCITY_PX_PER_MS = 2.6;
const MIN_SCROLL_MS = 320;
const MAX_SCROLL_MS = 520;
const HEADER_OFFSET_PX = 80;

function smoothScrollToY(targetY: number) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo(0, targetY);
    return;
  }

  const startY = window.scrollY;
  const distance = targetY - startY;
  const absDistance = Math.abs(distance);
  if (absDistance < 2) return;

  const durationMs = Math.min(
    MAX_SCROLL_MS,
    Math.max(MIN_SCROLL_MS, absDistance / SCROLL_VELOCITY_PX_PER_MS)
  );
  const startTime = performance.now();

  const step = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / durationMs, 1);
    // Ease-out cubic for crisp deceleration
    const eased = 1 - Math.pow(1 - progress, 3);
    window.scrollTo(0, startY + distance * eased);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
}

export function useActiveSection() {
  const [activeHref, setActiveHref] = useState<string>("/#top");

  useEffect(() => {
    const updateActiveFromScroll = () => {
      const scrollPos = window.scrollY + HEADER_OFFSET_PX + 120;
      let current = "/#top";

      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPos) {
          current = `/#${id}`;
        }
      }

      setActiveHref(current);
    };

    const rafId = requestAnimationFrame(() => {
      if (
        window.location.hash &&
        SECTION_IDS.some((id) => `#${id}` === window.location.hash)
      ) {
        setActiveHref(`/${window.location.hash}`);
      } else {
        updateActiveFromScroll();
      }
    });

    window.addEventListener("scroll", updateActiveFromScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", updateActiveFromScroll);
    };
  }, []);

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    const hashIndex = href.indexOf("#");
    if (hashIndex === -1) return;

    const id = href.slice(hashIndex + 1);
    const target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();
    setActiveHref(href);
    window.history.replaceState(null, "", href);

    const targetY =
      id === "top" ? 0 : Math.max(0, target.offsetTop - HEADER_OFFSET_PX);
    smoothScrollToY(targetY);
  };

  return { activeHref, handleNavClick };
}
