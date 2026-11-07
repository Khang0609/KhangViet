import {
  initialLandingContent,
  initialLeads,
  initialUsers,
} from "@khangviet/data";
import { type D1Client } from "./client";
import { usersTable } from "./schema/users.schema";
import { leadsTable } from "./schema/leads.schema";
import { projectsTable } from "./schema/projects.schema";
import { cmsMetadataTable } from "./schema/cms.schema";

/**
 * Hàm khởi tạo dữ liệu mẫu ban đầu (Seed) cho Cloudflare D1.
 * Đảm bảo dữ liệu portfolio, leads mẫu và tài khoản quản trị sẵn sàng
 * khi khởi tạo database mới trên môi trường staging hoặc production.
 */
export async function seedD1Database(client: D1Client): Promise<void> {
  const now = new Date().toISOString();

  // 1. Seed Users
  for (const user of initialUsers) {
    await client
      .insert(usersTable)
      .values({
        id: user.id,
        email: user.email,
        password: user.password,
        role: user.role,
        name: user.info.name,
        phone: user.info.phone,
        createdAt: user.createdAt || now,
        updatedAt: user.updatedAt || now,
      })
      .onConflictDoNothing();
  }

  // 2. Seed Leads
  for (const lead of initialLeads) {
    await client
      .insert(leadsTable)
      .values({
        id: lead.id,
        fullName: lead.fullName,
        phone: lead.phone,
        email: lead.email ?? null,
        serviceCategory: lead.serviceCategory ?? null,
        projectScale: lead.projectScale ?? null,
        message: lead.message ?? null,
        status: lead.status,
        notes: lead.notes ?? null,
        createdAt: lead.createdAt || now,
        updatedAt: lead.updatedAt || now,
      })
      .onConflictDoNothing();
  }

  // 3. Seed Projects
  for (const project of initialLandingContent.featuredProjects) {
    await client
      .insert(projectsTable)
      .values({
        id: project.id,
        code: project.code,
        title: project.title,
        subtitle: project.subtitle,
        client: project.client,
        locations: project.locations,
        year: project.year,
        categoryTag: project.categoryTag,
        scaleMetric: project.scaleMetric,
        materials: project.materials,
        engineeringNotes: project.engineeringNotes,
        summary: project.summary,
        coverImage: project.coverImage,
        gallery: project.gallery,
      })
      .onConflictDoNothing();
  }

  // 4. Seed CMS Metadata
  await client
    .insert(cmsMetadataTable)
    .values({
      key: "hero_slides",
      valueJson: JSON.stringify(initialLandingContent.heroSlides),
      updatedAt: now,
    })
    .onConflictDoNothing();

  await client
    .insert(cmsMetadataTable)
    .values({
      key: "legal_info",
      valueJson: JSON.stringify(initialLandingContent.companyLegalInfo),
      updatedAt: now,
    })
    .onConflictDoNothing();
}
