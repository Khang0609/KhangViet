import { initialLandingContent, initialLeads, initialUsers } from "@khangviet/data";
import { type D1Client } from "./client";
import { identitiesTable } from "./schema/identities.schema";
import { userAccountsTable } from "./schema/user-accounts.schema";
import { leadsTable } from "./schema/leads.schema";
import { cmsMetadataTable } from "./schema/cms.schema";
import { seedProjectsAndMedia } from "./seed-projects";

async function seedUsers(client: D1Client, now: string) {
  for (const user of initialUsers) {
    const t = user.createdAt || now;
    await client.insert(identitiesTable).values({
      id: user.id,
      fullName: user.info.name,
      phone: user.info.phone,
      email: user.email,
      identityType: "INDIVIDUAL",
      createdAt: t,
      updatedAt: user.updatedAt || now,
    }).onConflictDoNothing();

    await client.insert(userAccountsTable).values({
      id: user.id,
      identityId: user.id,
      email: user.email,
      passwordHash: user.password,
      role: user.role,
      isActive: 1,
      createdAt: t,
      updatedAt: user.updatedAt || now,
    }).onConflictDoNothing();
  }
}

async function seedLeads(client: D1Client, now: string) {
  for (const lead of initialLeads) {
    const t = lead.createdAt || now;
    await client.insert(identitiesTable).values({
      id: lead.id,
      fullName: lead.fullName,
      phone: lead.phone,
      email: lead.email ?? null,
      identityType: "INDIVIDUAL",
      notes: lead.notes ?? null,
      createdAt: t,
      updatedAt: lead.updatedAt || now,
    }).onConflictDoNothing();

    await client.insert(leadsTable).values({
      id: lead.id,
      identityId: lead.id,
      serviceCategory: lead.serviceCategory ?? null,
      projectScale: lead.projectScale ?? null,
      initialMessage: lead.message ?? null,
      status: lead.status,
      createdAt: t,
      updatedAt: lead.updatedAt || now,
    }).onConflictDoNothing();
  }
}

export async function seedD1Database(client: D1Client): Promise<void> {
  const now = new Date().toISOString();
  await seedUsers(client, now);
  await seedLeads(client, now);
  await seedProjectsAndMedia(client, now);

  await client.insert(cmsMetadataTable).values({
    key: "hero_slides",
    valueJson: JSON.stringify(initialLandingContent.heroSlides),
    updatedAt: now,
  }).onConflictDoNothing();

  await client.insert(cmsMetadataTable).values({
    key: "legal_info",
    valueJson: JSON.stringify(initialLandingContent.companyLegalInfo),
    updatedAt: now,
  }).onConflictDoNothing();
}
