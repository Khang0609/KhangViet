import {
  HeroSlide,
  PartnerBrand,
  CoreDiscipline,
  ProductionDivision,
  CompanyLegalInfo,
} from "./cms";
import { FeaturedProject } from "./project";

export interface LandingContent {
  heroSlides: HeroSlide[];
  partnerBrands: PartnerBrand[];
  coreDisciplines: CoreDiscipline[];
  featuredProjects: FeaturedProject[];
  productionDivisions: ProductionDivision[];
  companyLegalInfo: CompanyLegalInfo;
}

