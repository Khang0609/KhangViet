import { z } from "zod";
import {
  HeroSlideSchema,
  PartnerBrandSchema,
  CoreDisciplineSchema,
  ProductionDivisionSchema,
  CompanyLegalInfoSchema,
} from "./cms";
import { FeaturedProjectSchema } from "./project";

export const LandingContentSchema = z.object({
  heroSlides: z.array(HeroSlideSchema),
  partnerBrands: z.array(PartnerBrandSchema),
  coreDisciplines: z.array(CoreDisciplineSchema),
  featuredProjects: z.array(FeaturedProjectSchema),
  productionDivisions: z.array(ProductionDivisionSchema),
  companyLegalInfo: CompanyLegalInfoSchema,
});
export type LandingContent = z.infer<typeof LandingContentSchema>;
