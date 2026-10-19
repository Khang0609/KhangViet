export interface HeroSlide {
  id: string;
  image: string;
  tag: string;
  title: string;
  location: string;
  specs: string;
  lightingMode: string;
}

export interface PartnerBrand {
  name: string;
  subtitle: string;
  category: string;
  logoUrl?: string;
}

export interface CoreDiscipline {
  number: string;
  code: string;
  title: string;
  vietnameseTitle: string;
  description: string;
  specs: string[];
  previewImage: string;
  metricLabel: string;
  metricValue: string;
}

export interface ProductionDivision {
  code: string;
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
  hotlineFormatted: string;
  email: string;
  commitment: string;
}
