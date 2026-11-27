"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Manages a 3-set infinite horizontal scroll carousel with smooth pointer drag
 * and snap-on-release (snap is disabled during active drag to prevent lag).
 */
export function useInfiniteCarousel(itemCount: number) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const dragRef = useRef({
    isDown: false,
    startX: 0,
    startScrollLeft: 0,
    didDrag: false,
  });

  // Start in the middle set so user can scroll infinitely left or right
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || itemCount === 0) return;

    const oneSetWidth = el.scrollWidth / 3;
    if (oneSetWidth > 0) {
      el.scrollLeft = oneSetWidth;
    }
  }, [itemCount]);

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;

    const oneSetWidth = el.scrollWidth / 3;
    if (oneSetWidth <= 0) return;

    if (el.scrollLeft < oneSetWidth * 0.4) {
      el.scrollLeft += oneSetWidth;
    } else if (el.scrollLeft > oneSetWidth * 1.6) {
      el.scrollLeft -= oneSetWidth;
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;

    dragRef.current = {
      isDown: true,
      startX: e.clientX,
      startScrollLeft: el.scrollLeft,
      didDrag: false,
    };
    setIsDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    const state = dragRef.current;
    if (!el || !state.isDown) return;

    const dx = e.clientX - state.startX;
    if (Math.abs(dx) > 6) {
      state.didDrag = true;
    }
    el.scrollLeft = state.startScrollLeft - dx;
  };

  const onPointerEnd = () => {
    if (!dragRef.current.isDown) return;
    dragRef.current.isDown = false;
    setIsDragging(false);

    window.setTimeout(() => {
      dragRef.current.didDrag = false;
    }, 0);
  };

  const shouldPreventClick = () => dragRef.current.didDrag;

  return {
    scrollerRef: scrollerRef as RefObject<HTMLDivElement | null>,
    isDragging,
    handleScroll,
    onPointerDown,
    onPointerMove,
    onPointerEnd,
    shouldPreventClick,
  };
}
