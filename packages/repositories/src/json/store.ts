import {
  initialLandingContent,
  initialProjectGallery,
  initialLeads,
  initialUsers,
} from "@khangviet/data";
import type {
  LandingContent,
  ContactLead,
  User,
  GalleryProject,
  GalleryKeyAccount,
  GalleryStats,
  ProjectMedia,
  ProjectComparisonPair,
  LandingPlacement,
} from "@khangviet/types";

function buildDefaultMediaAndComparisons(
  projects: LandingContent["featuredProjects"]
): {
  media: ProjectMedia[];
  comparisons: ProjectComparisonPair[];
} {
  const now = "2026-01-01T00:00:00.000Z";
  const media: ProjectMedia[] = [];
  const comparisons: ProjectComparisonPair[] = [];

  for (const p of projects.slice(0, 3)) {
    const actualId = `media-${p.id}-actual`;
    const renderId = `media-${p.id}-render`;
    const actualUrl = p.coverImage;
    const renderUrl = p.gallery[0]?.src ?? p.coverImage;

    media.push(
      {
        id: actualId,
        projectId: p.id,
        mediaType: "ACTUAL",
        r2Key: `projects/${p.id}/actual.jpg`,
        publicUrl: actualUrl,
        caption: `${p.title} - Thực tế nghiệm thu`,
        location: p.locations[0] ?? "TP.HCM",
        spec: p.scaleMetric,
        aspectRatio: "landscape",
        sortOrder: 0,
        createdAt: now,
      },
      {
        id: renderId,
        projectId: p.id,
        mediaType: "RENDER_3D",
        r2Key: `projects/${p.id}/render-3d.jpg`,
        publicUrl: renderUrl,
        caption: `${p.title} - Phối cảnh 3D`,
        location: p.locations[0] ?? "TP.HCM",
        spec: "3D Concept",
        aspectRatio: "landscape",
        sortOrder: 1,
        createdAt: now,
      }
    );

    comparisons.push({
      id: `cmp-${p.id}-1`,
      projectId: p.id,
      renderMediaId: renderId,
      actualMediaId: actualId,
      title: "Đối chiếu Phối cảnh 3D ⇄ Thực tế thi công",
      sortOrder: 0,
      renderUrl,
      actualUrl,
    });
  }

  return { media, comparisons };
}

function buildDefaultPlacements(
  landing: LandingContent
): LandingPlacement[] {
  const now = "2026-01-01T00:00:00.000Z";
  const firstProjectId = landing.featuredProjects[0]?.id ?? "kv-project-1";

  const heroPlacements: LandingPlacement[] = landing.heroSlides.map(
    (slide, idx) => ({
      id: `pl-hero-${idx + 1}`,
      slotType: "HERO_SLIDE",
      projectId:
        landing.featuredProjects[idx]?.id ?? firstProjectId,
      sortOrder: idx,
      customMeta: {
        slideId: slide.id,
        image: slide.image,
        tag: slide.tag,
        title: slide.title,
        location: slide.location,
        specs: slide.specs,
        lightingMode: slide.lightingMode,
      },
      createdAt: now,
      updatedAt: now,
    })
  );

  const featuredPlacements: LandingPlacement[] = landing.featuredProjects.map(
    (proj, idx) => ({
      id: `pl-featured-${idx + 1}`,
      slotType: "FEATURED_SHOWCASE",
      projectId: proj.id,
      sortOrder: idx,
      customMeta: null,
      createdAt: now,
      updatedAt: now,
    })
  );

  return [...heroPlacements, ...featuredPlacements];
}

class MockMemoryStore {
  public landing: LandingContent = JSON.parse(
    JSON.stringify(initialLandingContent)
  );
  public galleryProjects: GalleryProject[] = JSON.parse(
    JSON.stringify(initialProjectGallery.projects)
  );
  public keyAccounts: GalleryKeyAccount[] = JSON.parse(
    JSON.stringify(initialProjectGallery.keyAccounts)
  );
  public galleryCategories: string[] = [...initialProjectGallery.categories];
  public galleryStats: GalleryStats | undefined = initialProjectGallery.stats
    ? { ...initialProjectGallery.stats }
    : undefined;

  public projectMedia: ProjectMedia[] = [];
  public projectComparisons: ProjectComparisonPair[] = [];
  public landingPlacements: LandingPlacement[] = [];

  public leads: ContactLead[] = JSON.parse(JSON.stringify(initialLeads));
  public users: User[] = JSON.parse(JSON.stringify(initialUsers));

  constructor() {
    this.initDerivedFixtures();
  }

  private initDerivedFixtures() {
    const { media, comparisons } = buildDefaultMediaAndComparisons(
      this.landing.featuredProjects
    );
    this.projectMedia = media;
    this.projectComparisons = comparisons;
    this.landingPlacements = buildDefaultPlacements(this.landing);
  }

  reset() {
    this.landing = JSON.parse(JSON.stringify(initialLandingContent));
    this.galleryProjects = JSON.parse(
      JSON.stringify(initialProjectGallery.projects)
    );
    this.keyAccounts = JSON.parse(
      JSON.stringify(initialProjectGallery.keyAccounts)
    );
    this.galleryCategories = [...initialProjectGallery.categories];
    this.galleryStats = initialProjectGallery.stats
      ? { ...initialProjectGallery.stats }
      : undefined;
    this.leads = JSON.parse(JSON.stringify(initialLeads));
    this.users = JSON.parse(JSON.stringify(initialUsers));
    this.initDerivedFixtures();
  }
}

export const mockStore = new MockMemoryStore();
