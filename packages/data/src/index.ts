import landingSeedData from "./seeds/landing-content.json";
import leadsSeedData from "./seeds/leads.json";
import usersSeedData from "./seeds/users.json";
import galleryExtSeedData from "./seeds/project-gallery-ext.json";
import type {
  LandingContent,
  ContactLead,
  User,
  FeaturedProject,
  GalleryProject,
  GalleryKeyAccount,
  GalleryStats,
  ProjectGalleryResponse,
} from "@khangviet/types";

export const initialLandingContent: LandingContent =
  landingSeedData as unknown as LandingContent;

export const initialLeads: ContactLead[] =
  leadsSeedData as unknown as ContactLead[];

export const initialUsers: User[] = usersSeedData as unknown as User[];

interface GalleryExtSeed {
  stats: GalleryStats;
  categories: string[];
  keyAccounts: GalleryKeyAccount[];
  featuredProjectOverrides: Record<
    string,
    Pick<
      GalleryProject,
      "keyAccount" | "segment" | "stage" | "category" | "team" | "img3D" | "featured"
    >
  >;
  additionalProjects: GalleryProject[];
}

const galleryExt = galleryExtSeedData as unknown as GalleryExtSeed;

function mapFeaturedToGalleryProject(project: FeaturedProject): GalleryProject {
  const override = galleryExt.featuredProjectOverrides[project.id];
  return {
    id: project.id,
    code: project.code,
    title: project.title,
    client: project.client,
    keyAccount: override?.keyAccount ?? null,
    segment: override?.segment ?? "B2B",
    stage: override?.stage ?? "COMPLETED",
    category: override?.category ?? "Bảng hiệu & Mặt dựng",
    location: project.locations.join(" • "),
    material: project.materials.slice(0, 2).join(", "),
    team: override?.team ?? "Đội ngũ Khang Việt",
    imgActual: project.coverImage,
    img3D: override?.img3D ?? project.gallery[0]?.src ?? project.coverImage,
    desc: project.summary,
    year: project.year,
    featured: override?.featured ?? true,
  };
}

export const initialProjectGallery: ProjectGalleryResponse = {
  projects: [
    ...initialLandingContent.featuredProjects.map(mapFeaturedToGalleryProject),
    ...galleryExt.additionalProjects,
  ],
  keyAccounts: galleryExt.keyAccounts,
  categories: galleryExt.categories,
  stats: galleryExt.stats,
};

export { landingSeedData, leadsSeedData, usersSeedData, galleryExtSeedData };
