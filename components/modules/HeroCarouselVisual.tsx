"use client";

import React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlide } from "@/types/landing";
import { useHeroSlides } from "@/components/contexts/LandingContext";
import { useCarousel } from "@/hooks/useCarousel";

export interface HeroCarouselVisualProps {
  slides?: HeroSlide[];
}

export const HeroCarouselVisual: React.FC<HeroCarouselVisualProps> = ({
  slides,
}) => {
  const contextSlides = useHeroSlides();
  const activeSlides =
    slides && slides.length > 0 ? slides : contextSlides;
  const {
    currentIndex: heroSlide,
    next,
    prev,
    goTo,
  } = useCarousel(activeSlides.length, 6500);
  const currentSlide = activeSlides[heroSlide] || activeSlides[0];

  return (
    <div className="lg:col-span-7">
      <div className="group relative aspect-4/3 overflow-hidden rounded-2xl bg-[#eae5dc] shadow-sm md:aspect-video">
        {activeSlides.map((slide, index) => (
          <Image
            key={slide.id}
            src={slide.image}
            alt={slide.title}
            fill
            sizes="(max-width: 1024px) 100vw, 58vw"
            className={`object-cover transition-all duration-700 ${
              index === heroSlide ? "scale-100 opacity-100" : "scale-105 opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-x-0 bottom-5 flex items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={prev}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#f4f1ea]/95 text-[#1a1918] shadow-md transition-transform hover:scale-105"
            aria-label="Ảnh dự án trước"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={next}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#f4f1ea]/95 text-[#1a1918] shadow-md transition-transform hover:scale-105"
            aria-label="Ảnh dự án tiếp theo"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-3.5 flex items-center justify-between gap-4">
        <span className="text-xs font-medium text-[#625f5a]">
          {currentSlide.title}
        </span>
        <div className="flex gap-1.5">
          {activeSlides.map((slide, index) => (
            <button
              type="button"
              key={slide.id}
              onClick={() => goTo(index)}
              className={`h-1.5 cursor-pointer rounded-full transition-all ${
                index === heroSlide
                  ? "w-6 bg-(--accent-bronze)"
                  : "w-1.5 bg-black/15 hover:bg-black/30"
              }`}
              aria-label={`Xem slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroCarouselVisual;
