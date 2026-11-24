import { getStore } from "../json/store";
import type { D1Client } from "./client";
import {
  leadActivitiesTable,
  leadsTable,
  organizationsTable,
  projectComparisonsTable,
  projectMediaTable,
  projectServicesTable,
  projectsTable,
  servicesTable,
  siteSettingsTable,
  usersTable,
} from "./schema";

export async function seedDatabase(db: D1Client): Promise<void> {
  const store = getStore();
  const now = Math.floor(Date.now() / 1000);

  if (store.organizations.length > 0) {
    await db
      .insert(organizationsTable)
      .values(
        store.organizations.map((o) => ({
          id: o.id,
          name: o.name,
          slug: o.slug,
          description: o.description ?? null,
          logoKey: o.logoKey ?? null,
          isFeatured: o.isFeatured ? 1 : 0,
          featuredOrder: o.featuredOrder,
          createdAt: o.createdAt,
          updatedAt: o.updatedAt,
        }))
      )
      .onConflictDoNothing();
  }

  if (store.services.length > 0) {
    await db
      .insert(servicesTable)
      .values(store.services)
      .onConflictDoNothing();
  }

  if (store.projects.length > 0) {
    await db
      .insert(projectsTable)
      .values(
        store.projects.map((p) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          summary: p.summary ?? null,
          organizationId: p.organizationId ?? null,
          year: p.year ?? null,
          publishStatus: p.publishStatus,
          isFeatured: p.isFeatured ? 1 : 0,
          featuredOrder: p.featuredOrder,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        }))
      )
      .onConflictDoNothing();
  }

  if (store.projectServices.length > 0) {
    await db
      .insert(projectServicesTable)
      .values(store.projectServices)
      .onConflictDoNothing();
  }

  if (store.projectMedia.length > 0) {
    await db
      .insert(projectMediaTable)
      .values(
        store.projectMedia.map((m) => ({
          id: m.id,
          projectId: m.projectId,
          kind: m.kind,
          storageKey: m.storageKey,
          altText: m.altText ?? null,
          caption: m.caption ?? null,
          sortOrder: m.sortOrder,
          isCover: m.isCover ? 1 : 0,
          createdAt: m.createdAt,
        }))
      )
      .onConflictDoNothing();
  }

  if (store.projectComparisons.length > 0) {
    await db
      .insert(projectComparisonsTable)
      .values(store.projectComparisons)
      .onConflictDoNothing();
  }

  if (store.users.length > 0) {
    await db
      .insert(usersTable)
      .values(
        store.users.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          isActive: u.isActive ? 1 : 0,
          createdAt: u.createdAt,
        }))
      )
      .onConflictDoNothing();
  }

  if (store.leads.length > 0) {
    await db
      .insert(leadsTable)
      .values(store.leads)
      .onConflictDoNothing();
  }

  if (store.leadActivities.length > 0) {
    await db
      .insert(leadActivitiesTable)
      .values(store.leadActivities)
      .onConflictDoNothing();
  }

  const settings = [
    { key: "hero_slides", valueJson: JSON.stringify(store.heroSlides), updatedAt: now },
    {
      key: "core_disciplines",
      valueJson: JSON.stringify(store.coreDisciplines),
      updatedAt: now,
    },
    {
      key: "production_divisions",
      valueJson: JSON.stringify(store.productionDivisions),
      updatedAt: now,
    },
    {
      key: "company_legal_info",
      valueJson: JSON.stringify(store.companyLegalInfo),
      updatedAt: now,
    },
    {
      key: "gallery_clusters",
      valueJson: JSON.stringify(store.galleryClusters),
      updatedAt: now,
    },
  ];
  await db.insert(siteSettingsTable).values(settings).onConflictDoNothing();
}
