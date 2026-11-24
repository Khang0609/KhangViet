import {
  galleryExtSeedData,
  landingSeedData,
  leadsSeedData,
  usersSeedData,
} from "@khangviet/data";
import type {
  CompanyLegalInfo,
  CoreDiscipline,
  GalleryClusterConfig,
  HeroSlide,
  Lead,
  LeadActivity,
  Organization,
  ProductionDivision,
  Project,
  ProjectComparison,
  ProjectMedia,
  Service,
  User,
} from "@khangviet/types";
import { slugify } from "../utils/slugify";

export interface MemoryStoreV2 {
  organizations: Organization[];
  services: Service[];
  projects: Project[];
  projectServices: Array<{ projectId: string; serviceId: string }>;
  projectMedia: ProjectMedia[];
  projectComparisons: ProjectComparison[];
  leads: Lead[];
  leadActivities: LeadActivity[];
  users: User[];
  heroSlides: HeroSlide[];
  coreDisciplines: CoreDiscipline[];
  productionDivisions: ProductionDivision[];
  companyLegalInfo: CompanyLegalInfo;
  galleryClusters: GalleryClusterConfig[];
}

function buildInitialStore(): MemoryStoreV2 {
  const now = Math.floor(Date.now() / 1000);
  const rawLanding = landingSeedData as Record<string, unknown>;
  const rawGallery = galleryExtSeedData as Record<string, unknown>;

  const rawServices = (rawGallery.categories as string[] | undefined) ?? [
    "Bảng hiệu & Mặt dựng",
    "Nội thất & Showroom",
    "Thi công chuỗi F&B",
  ];
  const services: Service[] = rawServices.map((name, idx) => ({
    id: `svc-${idx + 1}`,
    slug: slugify(name),
    name,
    sortOrder: idx,
  }));

  const rawPartners =
    (rawLanding.partnerBrands as Array<{
      name: string;
      category?: string;
      logoUrl?: string;
    }>) ?? [];
  const organizations: Organization[] = rawPartners.map((p, idx) => ({
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
    (rawLanding.featuredProjects as Array<{
      id: string;
      title: string;
      client?: string;
      summary?: string;
      year?: string | number;
      coverImage?: string;
      gallery?: Array<{ id: string; src: string; caption?: string }>;
    }>) ?? [];

  const projects: Project[] = [];
  const projectServices: Array<{ projectId: string; serviceId: string }> = [];
  const projectMedia: ProjectMedia[] = [];
  const projectComparisons: ProjectComparison[] = [];

  rawFeatured.forEach((p, idx) => {
    const matchedOrg = organizations.find(
      (o) =>
        p.client &&
        o.name.toLowerCase().includes(p.client.toLowerCase().slice(0, 6))
    );
    projects.push({
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
    });
    if (services[0]) {
      projectServices.push({ projectId: p.id, serviceId: services[0].id });
    }
    if (p.coverImage) {
      projectMedia.push({
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
      projectMedia.push({
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
  });

  const rawUsers =
    (usersSeedData as Array<{
      id: string;
      email: string;
      role: string;
      info?: { name?: string };
    }>) ?? [];
  const users: User[] = rawUsers
    .filter((u) => u.role === "ADMIN" || u.role === "STAFF")
    .map((u) => ({
      id: u.id,
      email: u.email.toLowerCase(),
      name: u.info?.name || u.email,
      role: u.role === "ADMIN" ? "ADMIN" : "STAFF",
      isActive: true,
      createdAt: now,
    }));

  const rawLeads =
    (leadsSeedData as Array<{
      id: string;
      fullName?: string;
      name?: string;
      phone: string;
      email?: string;
      message?: string;
      status?: string;
    }>) ?? [];
  const leads: Lead[] = rawLeads.map((l) => ({
    id: l.id,
    name: l.name || l.fullName || "Khách hàng",
    email: l.email ?? null,
    phone: l.phone,
    companyName: null,
    serviceId: null,
    message: l.message ?? null,
    budgetRange: null,
    source: "website",
    status: "NEW",
    createdAt: now,
    updatedAt: now,
  }));

  const rawDisciplines =
    (rawLanding.coreDisciplines as Array<
      Record<string, unknown> & { code?: string; slug?: string }
    >) ?? [];
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
    (rawLanding.productionDivisions as Array<
      Record<string, unknown> & { code?: string; id?: string }
    >) ?? [];
  const productionDivisions: ProductionDivision[] = rawDivisions.map((d, i) => ({
    id: String(d.id ?? d.code ?? `div-${i + 1}`),
    name: String(d.name ?? ""),
    headcount: String(d.headcount ?? ""),
    unitLabel: String(d.unitLabel ?? ""),
    role: String(d.role ?? ""),
    equipment: String(d.equipment ?? ""),
  }));

  const galleryClusters: GalleryClusterConfig[] = services.map((s, idx) => ({
    id: `cluster-${s.slug}`,
    serviceSlug: s.slug,
    title: s.name,
    sortOrder: idx,
    maxItems: 6,
  }));

  return {
    organizations,
    services,
    projects,
    projectServices,
    projectMedia,
    projectComparisons,
    leads,
    leadActivities: [],
    users,
    heroSlides: (rawLanding.heroSlides as HeroSlide[]) ?? [],
    coreDisciplines,
    productionDivisions,
    companyLegalInfo: rawLanding.companyLegalInfo as CompanyLegalInfo,
    galleryClusters,
  };
}

let storeInstance: MemoryStoreV2 | null = null;

export function getStore(): MemoryStoreV2 {
  if (!storeInstance) {
    storeInstance = buildInitialStore();
  }
  return storeInstance;
}

export function resetStore(): void {
  storeInstance = buildInitialStore();
}
