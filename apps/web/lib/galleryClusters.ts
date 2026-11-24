import type {
  GalleryClusterConfig,
  GalleryProject,
  Organization,
  ProjectGalleryResponse,
  Service,
} from "@khangviet/types";

export type BentoLayoutPreset =
  | "hero-left"
  | "asymmetric-mosaic"
  | "panoramic-trio"
  | "editorial-split";

export type ClusterSurfaceTone = "ivory" | "stone" | "charcoal";

export interface ResolvedGalleryCluster {
  config: GalleryClusterConfig & {
    slug: string;
    description?: string | null;
    accentColor?: string;
    groupType: "partner" | "solution";
  };
  projects: GalleryProject[];
  bentoProjects: GalleryProject[];
  href: string;
  service?: Service;
  organization?: Organization;
  layoutPreset: BentoLayoutPreset;
  surfaceTone: ClusterSurfaceTone;
}

export interface CrossLinkItem {
  label: string;
  sublabel: string;
  href: string;
  accentColor?: string;
}

const PRESET_ROTATION: BentoLayoutPreset[] = [
  "hero-left",
  "asymmetric-mosaic",
  "panoramic-trio",
  "editorial-split",
];

const SURFACE_ROTATION: ClusterSurfaceTone[] = [
  "ivory",
  "stone",
  "ivory",
  "charcoal",
];

export function toGallerySlug(input: string): string {
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

export function getProjectCoverUrl(project: GalleryProject): string {
  return (
    project.coverMedia?.storageKey ??
    project.media.find((m) => m.kind === "ACTUAL")?.storageKey ??
    project.media[0]?.storageKey ??
    "/images/placeholder-project.jpg"
  );
}

export function getProjectRenderUrl(project: GalleryProject): string | null {
  return project.media.find((m) => m.kind === "RENDER")?.storageKey ?? null;
}

export function resolveGalleryClusters(data: ProjectGalleryResponse): {
  partnerClusters: ResolvedGalleryCluster[];
  solutionClusters: ResolvedGalleryCluster[];
} {
  const partnerClusters: ResolvedGalleryCluster[] = [];
  data.organizations.forEach((org, idx) => {
    const matching = data.projects.filter((p) => p.organization?.id === org.id);
    if (matching.length === 0) return;

    partnerClusters.push({
      config: {
        id: `partner-${org.slug}`,
        serviceSlug: org.slug,
        slug: org.slug,
        title: org.name,
        subtitle: org.description ?? undefined,
        description: org.description,
        sortOrder: idx,
        maxItems: 6,
        groupType: "partner",
      },
      projects: matching,
      bentoProjects: matching.slice(0, 6),
      href: `/projects/partners/${org.slug}`,
      organization: org,
      layoutPreset: PRESET_ROTATION[idx % PRESET_ROTATION.length],
      surfaceTone: SURFACE_ROTATION[idx % SURFACE_ROTATION.length],
    });
  });

  const sortedClusters = [...data.clusters].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );
  const solutionClusters: ResolvedGalleryCluster[] = [];

  sortedClusters.forEach((config, idx) => {
    const service = data.services.find((s) => s.slug === config.serviceSlug);
    const matching = data.projects.filter((p) =>
      p.services.some((s) => s.slug === config.serviceSlug)
    );
    if (matching.length === 0) return;

    solutionClusters.push({
      config: {
        ...config,
        slug: config.serviceSlug,
        description: config.subtitle ?? null,
        groupType: "solution",
      },
      projects: matching,
      bentoProjects: matching.slice(0, config.maxItems),
      href: `/projects/solutions/${config.serviceSlug}`,
      service,
      layoutPreset: PRESET_ROTATION[idx % PRESET_ROTATION.length],
      surfaceTone: SURFACE_ROTATION[idx % SURFACE_ROTATION.length],
    });
  });

  return { partnerClusters, solutionClusters };
}

export function getCrossLinksForProject(
  project: GalleryProject,
  currentGroupType: "partner" | "solution",
  partnerClusters: ResolvedGalleryCluster[],
  solutionClusters: ResolvedGalleryCluster[]
): CrossLinkItem[] {
  const links: CrossLinkItem[] = [];

  if (currentGroupType === "partner") {
    for (const svc of project.services) {
      const cluster = solutionClusters.find((c) => c.config.slug === svc.slug);
      if (cluster) {
        links.push({
          label: cluster.config.title,
          sublabel: "Giải pháp kỹ thuật",
          href: `${cluster.href}?project=${encodeURIComponent(project.id)}`,
        });
      }
    }
  } else if (project.organization) {
    const cluster = partnerClusters.find(
      (c) => c.organization?.id === project.organization?.id
    );
    if (cluster) {
      links.push({
        label: cluster.config.title,
        sublabel: "Hồ sơ đối tác",
        href: `${cluster.href}?project=${encodeURIComponent(project.id)}`,
      });
    }
  }

  return links;
}
