import type { HeroSlide } from "@khangviet/types";

export const createDefaultHeroSlide = (): HeroSlide => ({
  id: `slide-${Date.now()}`,
  image: "/image/projects/banner-1.jpg",
  tag: "Architectural Façade",
  title: "CÔNG TRÌNH MỚI 2026",
  location: "TP. Hồ Chí Minh",
  specs: "Khung thép & Kính Low-E",
  lightingMode: "Dynamic 4000K",
});

