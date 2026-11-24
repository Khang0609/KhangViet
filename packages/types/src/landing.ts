import { z } from "zod";
import {
  HeroSlideSchema,
  CoreDisciplineSchema,
  ProductionDivisionSchema,
  CompanyLegalInfoSchema,
} from "./cms";
import { OrganizationSchema, ProjectSchema } from "./project";

export const LandingContentSchema = z.object({
  heroSlides: z.array(HeroSlideSchema),
  featuredOrganizations: z.array(OrganizationSchema),
  coreDisciplines: z.array(CoreDisciplineSchema),
  featuredProjects: z.array(ProjectSchema),
  productionDivisions: z.array(ProductionDivisionSchema),
  companyLegalInfo: CompanyLegalInfoSchema,
});
export type LandingContent = z.infer<typeof LandingContentSchema>;
