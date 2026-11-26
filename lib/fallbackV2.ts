import {
  galleryExtSeedData,
  landingSeedData,
} from "@khangviet/data";
import type {
  CompanyLegalInfo,
  CoreDiscipline,
  GalleryClusterConfig,
  GalleryProject,
  HeroSlide,
  LandingContent,
  Organization,
  ProductionDivision,
  Project,
  ProjectGalleryResponse,
  ProjectMedia,
  Service,
} from "@khangviet/types";

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getFallbackLandingContent(): LandingContent {
  const now = 1700000000;
  const raw = landingSeedData as Record<string, unknown>;

  const rawPartners =
    (raw.partnerBrands as Array<{
      name: string;
      category?: string;
      logoUrl?: string;
    }>) ?? [];
  const featuredOrganizations: Organization[] = rawPartners.map((p, idx) => ({
    id: `org-${idx + 1}`,
    name: p.name,
    slug: slugify(p.name),
    description: p.category ?? null,
    logoKey: p.logoUrl ?? null,
    isFeatured: true,
    featuredOrder: idx,
    createdAt: now,
    updatedAt: now,
  }));

  const rawFeatured =
    (raw.featuredProjects as Array<{
      id: string;
      title: string;
      client?: string;
      summary?: string;
      year?: string | number;
      coverImage?: string;
      gallery?: Array<{ id: string; src: string; caption?: string }>;
    }>) ?? [];

  const featuredProjects: Project[] = rawFeatured.map((p, idx) => {
    const matchedOrg = featuredOrganizations.find(
      (o) =>
        p.client &&
        o.name.toLowerCase().includes(p.client.toLowerCase().slice(0, 6))
    );
    const media: ProjectMedia[] = [];
    if (p.coverImage) {
      media.push({
        id: `${p.id}-cover`,
        projectId: p.id,
        kind: "ACTUAL",
        storageKey: p.coverImage,
        altText: p.title,
        caption: "Ảnh thực tế công trình",
        sortOrder: 0,
        isCover: true,
        createdAt: now,
      });
    }
    (p.gallery ?? []).forEach((g, gIdx) => {
      media.push({
        id: g.id || `${p.id}-m-${gIdx}`,
        projectId: p.id,
        kind: gIdx === 0 ? "RENDER" : "GALLERY",
        storageKey: g.src,
        altText: p.title,
        caption: g.caption ?? null,
        sortOrder: gIdx + 1,
        isCover: false,
        createdAt: now,
      });
    });

    return {
      id: p.id,
      slug: slugify(p.title) || p.id,
      title: p.title,
      summary: p.summary ?? null,
      organizationId: matchedOrg?.id ?? null,
      year: p.year ? Number(p.year) || 2025 : 2025,
      publishStatus: "PUBLISHED",
      isFeatured: true,
      featuredOrder: idx,
      createdAt: now,
      updatedAt: now,
      organization:
        matchedOrg ??
        (p.client
          ? {
              id: `org-inline-${idx}`,
              name: p.client,
              slug: slugify(p.client),
              description: null,
              logoKey: null,
              isFeatured: false,
              featuredOrder: 0,
              createdAt: now,
              updatedAt: now,
            }
          : null),
      services: [],
      media,
      comparisons: [],
    };
  });

  const rawDisciplines =
    (raw.coreDisciplines as Array<Record<string, unknown>>) ?? [];
  const coreDisciplines: CoreDiscipline[] = rawDisciplines.map((d) => ({
    number: String(d.number ?? "01"),
    slug: String(d.slug ?? slugify(String(d.title ?? "service"))),
    title: String(d.title ?? ""),
    vietnameseTitle: String(d.vietnameseTitle ?? ""),
    description: String(d.description ?? ""),
    specs: Array.isArray(d.specs) ? (d.specs as string[]) : [],
    previewImage: String(d.previewImage ?? ""),
    metricLabel: String(d.metricLabel ?? ""),
    metricValue: String(d.metricValue ?? ""),
  }));

  const rawDivisions =
    (raw.productionDivisions as Array<Record<string, unknown>>) ?? [];
  const productionDivisions: ProductionDivision[] = rawDivisions.map((d, i) => ({
    id: String(d.id ?? d.code ?? `div-${i + 1}`),
    name: String(d.name ?? ""),
    headcount: String(d.headcount ?? ""),
    unitLabel: String(d.unitLabel ?? ""),
    role: String(d.role ?? ""),
    equipment: String(d.equipment ?? ""),
  }));

  return {
    heroSlides: (raw.heroSlides as HeroSlide[]) ?? [],
    featuredOrganizations,
    coreDisciplines,
    featuredProjects,
    productionDivisions,
    companyLegalInfo: raw.companyLegalInfo as CompanyLegalInfo,
  };
}

export function getFallbackGalleryData(): ProjectGalleryResponse {
  const landing = getFallbackLandingContent();
  const rawGallery = galleryExtSeedData as Record<string, unknown>;
  const rawCategories = (rawGallery.categories as string[]) ?? [
    "Bảng hiệu & Mặt dựng",
    "Nội thất & Showroom",
  ];
  const services: Service[] = rawCategories.map((name, idx) => ({
    id: `svc-${idx + 1}`,
    slug: slugify(name),
    name,
    sortOrder: idx,
  }));

  const projects: GalleryProject[] = landing.featuredProjects.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    summary: p.summary ?? null,
    year: p.year ?? null,
    publishStatus: p.publishStatus,
    isFeatured: p.isFeatured,
    featuredOrder: p.featuredOrder,
    organization: p.organization ?? null,
    services: services[0] ? [services[0]] : [],
    coverMedia: p.media?.[0] ?? null,
    media: p.media ?? [],
    comparisons: p.comparisons ?? [],
  }));

  const clusters: GalleryClusterConfig[] = services.map((s, idx) => ({
    id: `cluster-${s.slug}`,
    serviceSlug: s.slug,
    title: s.name,
    sortOrder: idx,
    maxItems: 6,
  }));

  return {
    clusters,
    services,
    organizations: landing.featuredOrganizations,
    projects,
  };
}
