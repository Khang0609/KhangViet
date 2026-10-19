import landingSeedData from "./seeds/landing-content.json";
import leadsSeedData from "./seeds/leads.json";
import type { LandingContent, ContactLead } from "@khangviet/types";

export const initialLandingContent: LandingContent =
  landingSeedData as unknown as LandingContent;

export const initialLeads: ContactLead[] =
  leadsSeedData as unknown as ContactLead[];

export { landingSeedData, leadsSeedData };

