import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook managing circular carousel/slider index and optional autoplay.
 */
export function useCarousel(length: number, autoPlayInterval?: number, initialIndex = 0) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const next = useCallback(() => {
    if (length <= 0) return;
    setCurrentIndex((prev) => (prev === length - 1 ? 0 : prev + 1));
  }, [length]);

  const prev = useCallback(() => {
    if (length <= 0) return;
    setCurrentIndex((prev) => (prev === 0 ? length - 1 : prev - 1));
  }, [length]);

  const goTo = useCallback((index: number) => {
    if (index >= 0 && index < length) {
      setCurrentIndex(index);
    }
  }, [length]);

  useEffect(() => {
    if (!autoPlayInterval || autoPlayInterval <= 0 || length <= 1) return;
    const timer = setInterval(next, autoPlayInterval);
    return () => clearInterval(timer);
  }, [next, autoPlayInterval, length]);

  return { currentIndex, setCurrentIndex, next, prev, goTo };
}

