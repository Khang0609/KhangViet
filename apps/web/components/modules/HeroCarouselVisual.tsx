"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HERO_SLIDES } from "@/data/khangVietData";
import { useCarousel } from "@/hooks/useCarousel";

export const HeroCarouselVisual: React.FC = () => {
  const {
    currentIndex: heroSlide,
    next,
    prev,
    goTo,
  } = useCarousel(HERO_SLIDES.length, 6500);
  const currentSlide = HERO_SLIDES[heroSlide];

  return (
    <div className="lg:col-span-7 lg:pl-4">
      <div className="amber-frame-glow group relative aspect-4/3 overflow-hidden bg-(--bg-surface) transition-shadow duration-700 md:aspect-video">
        {HERO_SLIDES.map((slide, index) => (
          <img
            key={slide.id}
            src={slide.image}
            alt={slide.title}
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ${
              index === heroSlide
                ? "scale-100 opacity-100"
                : "scale-105 opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/10 to-black/20" />
        <div className="absolute top-4 right-4 left-4 flex items-start justify-between gap-4 md:top-6 md:right-6 md:left-6">
          <span className="font-mono-tech max-w-[75%] bg-black/65 px-3 py-2 text-[9px] tracking-[0.15em] text-(--accent-bronze) uppercase backdrop-blur">
            {currentSlide.tag}
          </span>
          <span className="font-mono-tech hidden h-9 w-9 items-center justify-center border border-white/20 bg-black/40 text-[10px] md:flex">
            0{heroSlide + 1}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 md:p-7">
          <p className="font-mono-tech mb-2 text-[9px] tracking-[0.18em] text-(--accent-bronze) uppercase">
            {currentSlide.location}
          </p>
          <h2 className="font-syne max-w-2xl text-xl leading-tight font-bold md:text-3xl">
            {currentSlide.title}
          </h2>
          <p className="mt-2 hidden max-w-2xl text-xs leading-relaxed text-white/65 md:block">
            {currentSlide.specs}
          </p>
        </div>
        <div className="absolute top-1/2 right-4 flex -translate-y-1/2 flex-col gap-2">
          <button
            type="button"
            onClick={prev}
            className="flex h-9 w-9 cursor-pointer items-center justify-center border border-white/15 bg-black/55 transition-colors hover:border-(--accent-bronze) hover:text-(--accent-bronze)"
            aria-label="Ảnh dự án trước"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={next}
            className="flex h-9 w-9 cursor-pointer items-center justify-center border border-white/15 bg-black/55 transition-colors hover:border-(--accent-bronze) hover:text-(--accent-bronze)"
            aria-label="Ảnh dự án tiếp theo"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        {HERO_SLIDES.map((slide, index) => (
          <button
            type="button"
            key={slide.id}
            onClick={() => goTo(index)}
            className={`h-0.5 flex-1 cursor-pointer transition-colors ${
              index === heroSlide ? "bg-(--accent-bronze)" : "bg-white/15"
            }`}
            aria-label={`Xem slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarouselVisual;
