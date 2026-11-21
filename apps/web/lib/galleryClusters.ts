import type {
  BentoLayoutPreset,
  ClusterSurfaceTone,
  GalleryClusterConfig,
  GalleryKeyAccount,
  GalleryProject,
  ProjectGalleryResponse,
} from "@khangviet/types";

export interface ResolvedGalleryCluster {
  config: GalleryClusterConfig;
  projects: GalleryProject[];
  bentoProjects: GalleryProject[];
  href: string;
  partnerAccount?: GalleryKeyAccount;
}

export interface CrossLinkItem {
  label: string;
  sublabel: string;
  href: string;
  accentColor?: string;
}

const PARTNER_ACCENT_MAP: Record<string, string> = {
  BIDV: "#006B68",
  GO_BIGC: "#D92B2B",
  VINCOM: "#B87A14",
  EXIMBANK: "#00529C",
  DECATHLON: "#0072CE",
  NEWGYM: "#F58633",
};

const SOLUTION_DESCRIPTIONS: Record<
  string,
  { subtitle: string; description: string }
> = {
  "Bảng hiệu & Mặt dựng": {
    subtitle: "Mặt dựng Alu • Bảng hiệu chuỗi • Kết cấu thép ngoài trời",
    description:
      "Giải pháp nhận diện mặt tiền đồng bộ cho hệ thống ngân hàng, trung tâm thương mại và cửa hàng bán lẻ với độ bền thời tiết trên 5 năm.",
  },
  "Hộp đèn & Chữ nổi": {
    subtitle: "Hộp đèn bạt 3M • Chữ nổi Inox / Mica • Hệ thống LED hắt sáng",
    description:
      "Gia công chính xác chữ nổi Inox PVD, mica hút nổi và hộp đèn siêu mỏng ánh sáng đồng đều tại xưởng sản xuất trực tiếp Bình Tân.",
  },
  "Nội thất & Quầy giao dịch": {
    subtitle: "Quầy Teller • Showroom cao cấp • Kệ trưng bày cơ khí",
    description:
      "Thi công trọn gói không gian giao dịch VIP, quầy kệ trưng bày tiêu chuẩn quốc tế và nội thất gỗ MDF chống ẩm kết hợp kim loại.",
  },
  "Vẽ tường & POSM": {
    subtitle: "Tranh tường Acrylic • Mô hình CNC 3D • Vật phẩm sự kiện",
    description:
      "Đội họa sĩ mỹ thuật chuyên nghiệp kết hợp gia công mô hình CNC Formex, tạo điểm nhấn thị giác khác biệt cho không gian thương hiệu.",
  },
};

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
  "stone",
  "ivory",
];

/**
 * Chuẩn hóa chuỗi tiếng Việt có dấu thành slug URL an toàn
 */
export function toGallerySlug(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getPartnerSlug(keyAccountId: string): string {
  return toGallerySlug(keyAccountId);
}

export function getSolutionSlug(category: string): string {
  return toGallerySlug(category);
}

/**
 * Chuyển đổi focalPoint { x, y } từ DB/Admin sang CSS object-position
 */
export function getProjectObjectPosition(
  project?: GalleryProject | null
): string {
  if (!project?.focalPoint) return "50% 50%";
  const x = Math.min(100, Math.max(0, project.focalPoint.x ?? 50));
  const y = Math.min(100, Math.max(0, project.focalPoint.y ?? 50));
  return `${x}% ${y}%`;
}

function orderProjectsBySlots(
  projects: GalleryProject[],
  slotProjectIds: string[]
): GalleryProject[] {
  if (!slotProjectIds.length) return projects;
  const projectMap = new Map(projects.map((p) => [p.id, p]));
  const ordered: GalleryProject[] = [];
  const usedIds = new Set<string>();

  for (const id of slotProjectIds) {
    const found = projectMap.get(id);
    if (found) {
      ordered.push(found);
      usedIds.add(id);
    }
  }

  for (const p of projects) {
    if (!usedIds.has(p.id)) {
      ordered.push(p);
    }
  }

  return ordered;
}

function extractScaleWeight(scale: string): number {
  const match = scale.match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : 0;
}

/**
 * Gom nhóm dữ liệu thành các cụm Bento Tầng 1 & Tầng 2.
 * Ưu tiên đọc `data.clusters` (từ Admin Slot Picker nếu có), fallback thông minh nếu chưa cấu hình.
 */
export function resolveGalleryClusters(data: ProjectGalleryResponse): {
  partnerClusters: ResolvedGalleryCluster[];
  solutionClusters: ResolvedGalleryCluster[];
} {
  const customClusterMap = new Map(
    (data.clusters ?? []).map((c) => [`${c.groupType}:${c.groupKey}`, c])
  );

  // 1. Phần 1: Các cụm Đối tác chiến lược (sắp xếp theo số dự án nhiều nhất -> quy mô đối tác)
  const partnerEntries = data.keyAccounts
    .map((account, idx) => {
      const accountProjects = data.projects.filter(
        (p) => p.keyAccount === account.id
      );
      return { account, accountProjects, seedIdx: idx };
    })
    .filter((entry) => entry.accountProjects.length > 0)
    .sort((a, b) => {
      const customA = customClusterMap.get(`partner:${a.account.id}`);
      const customB = customClusterMap.get(`partner:${b.account.id}`);
      if (customA && customB && customA.sortOrder !== customB.sortOrder) {
        return customA.sortOrder - customB.sortOrder;
      }
      if (b.accountProjects.length !== a.accountProjects.length) {
        return b.accountProjects.length - a.accountProjects.length;
      }
      const scaleDiff =
        extractScaleWeight(b.account.scale) -
        extractScaleWeight(a.account.scale);
      if (scaleDiff !== 0) return scaleDiff;
      return a.seedIdx - b.seedIdx;
    });

  const partnerClusters: ResolvedGalleryCluster[] = partnerEntries.map(
    ({ account, accountProjects }, idx) => {
      const custom = customClusterMap.get(`partner:${account.id}`);
      const slug = custom?.slug ?? getPartnerSlug(account.id);
      const sortedProjects = orderProjectsBySlots(
        accountProjects,
        custom?.slotProjectIds ?? []
      );

      const config: GalleryClusterConfig = {
        id: custom?.id ?? `cluster-partner-${slug}`,
        groupType: "partner",
        groupKey: account.id,
        slug,
        title: custom?.title ?? account.name,
        subtitle: custom?.subtitle ?? account.tag,
        description: custom?.description ?? account.desc,
        layoutPreset:
          custom?.layoutPreset ?? PRESET_ROTATION[idx % PRESET_ROTATION.length],
        surfaceTone:
          custom?.surfaceTone ?? SURFACE_ROTATION[idx % SURFACE_ROTATION.length],
        accentColor:
          custom?.accentColor ?? PARTNER_ACCENT_MAP[account.id] ?? "#F58633",
        slotProjectIds: custom?.slotProjectIds ?? sortedProjects.map((p) => p.id),
        sortOrder: custom?.sortOrder ?? idx,
      };

      return {
        config,
        projects: sortedProjects,
        bentoProjects: sortedProjects.slice(0, 4),
        href: `/projects/partners/${slug}`,
        partnerAccount: account,
      };
    }
  );

  // 2. Phần 2: Các cụm Giải pháp kỹ thuật theo hạng mục
  const solutionClusters: ResolvedGalleryCluster[] = data.categories
    .map((category, idx) => {
      const categoryProjects = data.projects.filter(
        (p) => p.category === category
      );
      if (categoryProjects.length === 0) return null;

      // Ưu tiên dự án khách lẻ (C2B) hoặc dự án tiêu biểu ở đầu cụm Giải pháp
      const prioritized = [...categoryProjects].sort((a, b) => {
        if (a.segment !== b.segment) return a.segment === "C2B" ? -1 : 1;
        return Number(b.featured) - Number(a.featured);
      });

      const custom = customClusterMap.get(`solution:${category}`);
      const slug = custom?.slug ?? getSolutionSlug(category);
      const sortedProjects = orderProjectsBySlots(
        prioritized,
        custom?.slotProjectIds ?? []
      );
      const meta = SOLUTION_DESCRIPTIONS[category];

      const config: GalleryClusterConfig = {
        id: custom?.id ?? `cluster-solution-${slug}`,
        groupType: "solution",
        groupKey: category,
        slug,
        title: custom?.title ?? category,
        subtitle:
          custom?.subtitle ??
          meta?.subtitle ??
          `${sortedProjects.length} công trình tiêu biểu`,
        description:
          custom?.description ??
          meta?.description ??
          `Tổng hợp các công trình thi công thuộc hạng mục ${category} của Khang Việt Design.`,
        layoutPreset:
          custom?.layoutPreset ??
          PRESET_ROTATION[(idx + 1) % PRESET_ROTATION.length],
        surfaceTone:
          custom?.surfaceTone ?? (idx % 2 === 0 ? "stone" : "ivory"),
        accentColor: custom?.accentColor ?? "#F58633",
        slotProjectIds: custom?.slotProjectIds ?? sortedProjects.map((p) => p.id),
        sortOrder: custom?.sortOrder ?? idx,
      };

      return {
        config,
        projects: sortedProjects,
        bentoProjects: sortedProjects.slice(0, 4),
        href: `/projects/solutions/${slug}`,
      };
    })
    .filter((c): c is ResolvedGalleryCluster => c !== null);

  return { partnerClusters, solutionClusters };
}

/**
 * Sinh danh sách liên kết chéo ngữ cảnh (Cross-links) cho dự án đang xem ở Tầng 2
 */
export function getCrossLinksForProject(
  project: GalleryProject,
  currentGroupType: "partner" | "solution",
  partnerClusters: ResolvedGalleryCluster[],
  solutionClusters: ResolvedGalleryCluster[]
): CrossLinkItem[] {
  const links: CrossLinkItem[] = [];

  // Nếu đang xem trong trang Đối tác -> Gợi ý xem toàn bộ Giải pháp kỹ thuật cùng hạng mục
  const matchingSolution = solutionClusters.find(
    (c) => c.config.groupKey === project.category
  );
  if (
    matchingSolution &&
    (currentGroupType === "partner" ||
      matchingSolution.config.groupKey !== project.category)
  ) {
    links.push({
      label: `Xem các dự án ${matchingSolution.config.title}`,
      sublabel: `${matchingSolution.projects.length} công trình cùng giải pháp kỹ thuật`,
      href: `${matchingSolution.href}?project=${encodeURIComponent(project.id)}`,
      accentColor: matchingSolution.config.accentColor,
    });
  }

  // Nếu đang xem trong trang Giải pháp và dự án thuộc Đối tác lớn -> Gợi ý xem trọn bộ Đối tác đó
  if (project.keyAccount) {
    const matchingPartner = partnerClusters.find(
      (c) => c.config.groupKey === project.keyAccount
    );
    if (matchingPartner && currentGroupType === "solution") {
      links.push({
        label: `Khám phá trọn bộ ${matchingPartner.config.title}`,
        sublabel: matchingPartner.partnerAccount?.scale ?? "Đối tác chiến lược",
        href: `${matchingPartner.href}?project=${encodeURIComponent(project.id)}`,
        accentColor: matchingPartner.config.accentColor,
      });
    }
  }

  // Bổ sung 1 giải pháp liên quan khác để khách tiếp tục khám phá nếu mới có < 2 links
  if (links.length < 2) {
    const altSolution = solutionClusters.find(
      (c) =>
        c.config.groupKey !== project.category &&
        !links.some((l) => l.href.startsWith(c.href))
    );
    if (altSolution) {
      links.push({
        label: `Khám phá ${altSolution.config.title}`,
        sublabel: `${altSolution.projects.length} hồ sơ năng lực`,
        href: altSolution.href,
        accentColor: altSolution.config.accentColor,
      });
    }
  }

  return links;
}
