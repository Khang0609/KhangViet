import landingSeedData from "./seeds/landing-content.json";
import leadsSeedData from "./seeds/leads.json";
import usersSeedData from "./seeds/users.json";
import type { LandingContent, ContactLead, User } from "@khangviet/types";

export const initialLandingContent: LandingContent =
  landingSeedData as unknown as LandingContent;

export const initialLeads: ContactLead[] =
  leadsSeedData as unknown as ContactLead[];

export const initialUsers: User[] = usersSeedData as unknown as User[];

export { landingSeedData, leadsSeedData, usersSeedData };
