"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Layers, MapPin, Sparkles } from "lucide-react";
import type { BentoLayoutPreset, ClusterSurfaceTone, GalleryProject } from "@khangviet/types";
import {
  getProjectObjectPosition,
  type ResolvedGalleryCluster,
} from "@/lib/galleryClusters";

interface BentoClusterSectionProps {
  cluster: ResolvedGalleryCluster;
  chapterNumber: number;
}

interface BentoTile {
  key: string;
  project: GalleryProject;
  imageUrl: string;
  badge: string;
  title: string;
  meta: string;
  href: string;
}

function getSurfaceClasses(tone: ClusterSurfaceTone): {
  section: string;
  mutedText: string;
  cardBg: string;
  cardBorder: string;
  ctaIdle: string;
} {
  if (tone === "charcoal") {
    return {
      section: "bg-[#181715] text-white border-b border-white/10",
      mutedText: "text-white/65",
      cardBg: "bg-[#22201d]",
      cardBorder: "border-white/12",
      ctaIdle:
        "border-white/20 bg-white/8 text-white hover:bg-white hover:text-[#181715]",
    };
  }
  if (tone === "stone") {
    return {
      section: "bg-[#f1ede4] text-[#1a1918] border-b border-black/8",
      mutedText: "text-[#625f5a]",
      cardBg: "bg-white",
      cardBorder: "border-black/10",
      ctaIdle:
        "border-black/15 bg-white text-[#1a1918] hover:bg-[#1a1918] hover:text-white",
    };
  }
  return {
    section: "bg-[#faf9f6] text-[#1a1918] border-b border-black/8",
    mutedText: "text-[#625f5a]",
    cardBg: "bg-white",
    cardBorder: "border-black/10",
    ctaIdle:
      "border-black/15 bg-white text-[#1a1918] hover:bg-[#1a1918] hover:text-white",
  };
}

function buildBentoTiles(
  projects: GalleryProject[],
  baseHref: string
): BentoTile[] {
  const tiles: BentoTile[] = [];

  for (const project of projects) {
    tiles.push({
      key: `${project.id}-actual`,
      project,
      imageUrl: project.imgActual,
      badge:
        project.stage === "TENDER_3D" ? "Hồ sơ 2D/3D" : "Nghiệm thu thực tế",
      title: project.title,
      meta: `${project.category} • ${project.location}`,
      href: `${baseHref}?project=${encodeURIComponent(project.id)}`,
    });
  }

  // Nếu cụm có ít hơn 3 dự án, tận dụng phối cảnh 3D phụ trợ để bố cục Bento luôn cân đối
  if (tiles.length < 3) {
    for (const project of projects) {
      if (tiles.length >= 3) break;
      if (project.img3D && project.img3D !== project.imgActual) {
        tiles.push({
          key: `${project.id}-3d`,
          project,
          imageUrl: project.img3D,
          badge: "Phối cảnh kỹ thuật 3D",
          title: `Phương án 3D — ${project.title}`,
          meta: `${project.material}`,
          href: `${baseHref}?project=${encodeURIComponent(project.id)}&view=3d`,
        });
      }
    }
  }

  return tiles.slice(0, 4);
}

const BentoPhotoTile: React.FC<{
  tile: BentoTile;
  accentColor: string;
  className?: string;
  large?: boolean;
}> = ({ tile, accentColor, className = "", large = false }) => {
  return (
    <Link
      href={tile.href}
      className={`group relative flex flex-col justify-end overflow-hidden rounded-2xl border border-black/10 bg-[#181715] transition-transform duration-300 hover:-translate-y-0.5 ${className}`}
    >
      <img
        src={tile.imageUrl}
        alt={tile.title}
        loading="lazy"
        style={{ objectPosition: getProjectObjectPosition(tile.project) }}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-black/10 transition-opacity duration-300 group-hover:from-black/90" />

      {/* Top row: Code + Stage Badge */}
      <div className="relative z-10 flex items-start justify-between gap-2 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white shadow-xs backdrop-blur-md"
            style={{ backgroundColor: accentColor }}
          >
            {tile.badge}
          </span>
          {tile.project.code && (
            <span className="rounded-full border border-white/20 bg-black/45 px-2.5 py-1 font-mono text-[11px] font-medium text-white/90 backdrop-blur-md">
              {tile.project.code}
            </span>
          )}
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-md transition-all group-hover:border-white group-hover:bg-white group-hover:text-[#181715]">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      {/* Bottom copy */}
      <div className="relative z-10 mt-auto p-4 pt-12 sm:p-6">
        <h3
          className={`leading-snug font-semibold text-white ${
            large ? "text-lg sm:text-2xl" : "text-sm sm:text-base"
          }`}
        >
          {tile.title}
        </h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-white/75">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-white/70" />
          <span className="truncate">{tile.meta}</span>
        </p>
      </div>
    </Link>
  );
};

const SpecAnchorTile: React.FC<{
  cluster: ResolvedGalleryCluster;
  surface: ReturnType<typeof getSurfaceClasses>;
  accentColor: string;
  className?: string;
}> = ({ cluster, surface, accentColor, className = "" }) => {
  const leadProject = cluster.projects[0];
  return (
    <Link
      href={cluster.href}
      className={`group flex flex-col justify-between rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 sm:p-6 ${surface.cardBg} ${surface.cardBorder} ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase"
            style={{ color: accentColor }}
          >
            <Layers className="h-3.5 w-3.5" />
            Hồ sơ năng lực cụm
          </span>
          <span className={`text-xs font-medium tabular-nums ${surface.mutedText}`}>
            {cluster.projects.length} dự án
          </span>
        </div>

        <p className="mt-3 text-sm leading-relaxed font-medium">
          {cluster.config.description}
        </p>

        {leadProject && (
          <div className={`mt-4 border-t pt-3 text-xs ${surface.cardBorder} ${surface.mutedText}`}>
            <span className="font-semibold">Vật liệu tiêu biểu: </span>
            {leadProject.material}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between pt-2 text-xs font-semibold">
        <span style={{ color: accentColor }}>Mở Split-View chi tiết</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" style={{ color: accentColor }} />
      </div>
    </Link>
  );
};

function renderPresetGrid(
  preset: BentoLayoutPreset,
  tiles: BentoTile[],
  cluster: ResolvedGalleryCluster,
  surface: ReturnType<typeof getSurfaceClasses>,
  accentColor: string
) {
  const [t0, t1, t2, t3] = tiles;

  if (!t0) return null;

  // Preset 1: Hero Left (1 ô lớn 7 cột bên trái + 2 ô nhỏ xếp chồng 5 cột bên phải)
  if (preset === "hero-left") {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
        <BentoPhotoTile
          tile={t0}
          accentColor={accentColor}
          large
          className="min-h-80 lg:col-span-7 lg:min-h-115"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1 lg:gap-5">
          {t1 && (
            <BentoPhotoTile
              tile={t1}
              accentColor={accentColor}
              className="min-h-56 lg:min-h-55"
            />
          )}
          {t2 ? (
            <BentoPhotoTile
              tile={t2}
              accentColor={accentColor}
              className="min-h-56 lg:min-h-55"
            />
          ) : (
            <SpecAnchorTile
              cluster={cluster}
              surface={surface}
              accentColor={accentColor}
              className="min-h-52"
            />
          )}
        </div>
      </div>
    );
  }

  // Preset 2: Asymmetric Mosaic (ô 1 rộng 8 cột trên, ô 2 hẹp 4 cột, hàng dưới 2 ô + 1 thẻ spec)
  if (preset === "asymmetric-mosaic") {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12 lg:gap-5">
        <BentoPhotoTile
          tile={t0}
          accentColor={accentColor}
          large
          className="min-h-76 md:col-span-8 md:min-h-96"
        />
        {t1 ? (
          <BentoPhotoTile
            tile={t1}
            accentColor={accentColor}
            className="min-h-64 md:col-span-4 md:min-h-96"
          />
        ) : (
          <SpecAnchorTile
            cluster={cluster}
            surface={surface}
            accentColor={accentColor}
            className="md:col-span-4"
          />
        )}
        {t2 && (
          <BentoPhotoTile
            tile={t2}
            accentColor={accentColor}
            className={`min-h-60 ${t3 ? "md:col-span-4" : "md:col-span-7"}`}
          />
        )}
        {t3 ? (
          <BentoPhotoTile
            tile={t3}
            accentColor={accentColor}
            className="min-h-60 md:col-span-4"
          />
        ) : null}
        <SpecAnchorTile
          cluster={cluster}
          surface={surface}
          accentColor={accentColor}
          className={t2 && t3 ? "md:col-span-4" : t2 ? "md:col-span-5" : "md:col-span-12"}
        />
      </div>
    );
  }

  // Preset 3: Panoramic Trio (3 cột bất đối xứng chiều cao/nhịp điệu 5-4-3)
  if (preset === "panoramic-trio") {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12 lg:gap-5">
        <BentoPhotoTile
          tile={t0}
          accentColor={accentColor}
          large
          className="min-h-72 md:col-span-5 md:min-h-92"
        />
        {t1 ? (
          <BentoPhotoTile
            tile={t1}
            accentColor={accentColor}
            className="min-h-72 md:col-span-4 md:min-h-92"
          />
        ) : (
          <SpecAnchorTile
            cluster={cluster}
            surface={surface}
            accentColor={accentColor}
            className="md:col-span-4"
          />
        )}
        {t2 ? (
          <BentoPhotoTile
            tile={t2}
            accentColor={accentColor}
            className="min-h-72 md:col-span-3 md:min-h-92"
          />
        ) : (
          <SpecAnchorTile
            cluster={cluster}
            surface={surface}
            accentColor={accentColor}
            className="md:col-span-3"
          />
        )}
      </div>
    );
  }

  // Preset 4: Editorial Split (Trái: Thẻ câu chuyện + ô ảnh nhỏ; Phải: Ô ảnh lớn dọc)
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
      <div className="grid grid-cols-1 gap-4 lg:col-span-5 lg:gap-5">
        <SpecAnchorTile
          cluster={cluster}
          surface={surface}
          accentColor={accentColor}
          className="min-h-52"
        />
        {t1 && (
          <BentoPhotoTile
            tile={t1}
            accentColor={accentColor}
            className="min-h-60"
          />
        )}
      </div>
      <BentoPhotoTile
        tile={t0}
        accentColor={accentColor}
        large
        className="min-h-80 lg:col-span-7 lg:min-h-115"
      />
    </div>
  );
}

export const BentoClusterSection: React.FC<BentoClusterSectionProps> = ({
  cluster,
  chapterNumber,
}) => {
  const { config, projects, href } = cluster;
  const surface = getSurfaceClasses(config.surfaceTone);
  const accentColor = config.accentColor ?? "#F58633";
  const tiles = buildBentoTiles(projects, href);
  const chapterCode = String(chapterNumber).padStart(2, "0");

  return (
    <section
      id={config.id}
      className={`scroll-mt-36 py-12 sm:py-16 ${surface.section}`}
    >
      <div className="mx-auto max-w-360 px-5 md:px-8 xl:px-12">
        {/* Cluster Story Header */}
        <div className="mb-7 flex flex-col justify-between gap-5 md:mb-9 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold tracking-wider text-white"
                style={{ backgroundColor: accentColor }}
              >
                <Sparkles className="h-3 w-3" />
                CHƯƠNG {chapterCode}
              </span>
              {config.subtitle && (
                <span className={`text-xs font-medium ${surface.mutedText}`}>
                  {config.subtitle}
                </span>
              )}
            </div>

            <h2 className="mt-2.5 text-2xl font-semibold tracking-tight sm:text-3xl">
              <Link
                href={href}
                className="transition-opacity hover:opacity-80"
              >
                {config.title}
              </Link>
            </h2>

            {config.description && (
              <p className={`mt-2 text-sm leading-relaxed ${surface.mutedText}`}>
                {config.description}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <Link
              href={href}
              className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-semibold transition-all ${surface.ctaIdle}`}
            >
              <span>
                Khám phá trọn bộ ({projects.length} dự án)
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Bento Grid theo Preset */}
        {renderPresetGrid(
          config.layoutPreset,
          tiles,
          cluster,
          surface,
          accentColor
        )}
      </div>
    </section>
  );
};

export default BentoClusterSection;
