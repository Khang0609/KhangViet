export interface HeroSlide {
  id: string;
  image: string;
  tag: string;
  title: string;
  location: string;
  specs: string;
  lightingMode: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoKey: string | null;
  isFeatured: boolean;
  featuredOrder: number;
}

export interface CoreDiscipline {
  number: string;
  slug: string;
  title: string;
  vietnameseTitle: string;
  description: string;
  specs: string[];
  previewImage: string;
  metricLabel: string;
  metricValue: string;
}

export interface ProjectServiceTag {
  id: string;
  slug: string;
  name: string;
}

export interface ProjectMedia {
  id: string;
  projectId: string;
  kind: "ACTUAL" | "RENDER" | "GALLERY";
  storageKey: string;
  altText: string | null;
  caption: string | null;
  sortOrder: number;
  isCover: boolean;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  organizationId: string | null;
  year: number | null;
  organization: Organization | null;
  services: ProjectServiceTag[];
  media: ProjectMedia[];
}

export interface ProductionDivision {
  id: string;
  name: string;
  headcount: string;
  unitLabel: string;
  role: string;
  equipment: string;
}

export interface CompanyLegalInfo {
  fullName: string;
  shortName: string;
  establishedYear: number;
  taxId: string;
  licenseIssuer: string;
  licenseDate: string;
  director: string;
  directorTitle: string;
  factoryAddress: string;
  hotline: string;
  email: string;
  commitment: string;
}

export interface LandingContent {
  heroSlides: HeroSlide[];
  featuredOrganizations: Organization[];
  coreDisciplines: CoreDiscipline[];
  featuredProjects: Project[];
  productionDivisions: ProductionDivision[];
  companyLegalInfo: CompanyLegalInfo;
}
