import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import landingSeedData from "@khangviet/data/seeds/landing-content.json" with { type: "json" };
import leadsSeedData from "@khangviet/data/seeds/leads.json" with { type: "json" };
import usersSeedData from "@khangviet/data/seeds/users.json" with { type: "json" };
import galleryExtSeedData from "@khangviet/data/seeds/project-gallery-ext.json" with { type: "json" };

function slugify(input) {
  return String(input)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const seedFileUrl = import.meta.resolve("@khangviet/data/seeds/landing-content.json");
const seedFilePath = fileURLToPath(seedFileUrl);
const rootDir = path.resolve(path.dirname(seedFilePath), "../../../..");
const dbDir = path.resolve(
  rootDir,
  "apps/api/.wrangler/state/v3/d1/miniflare-D1DatabaseObject"
);

const sqliteFiles = fs
  .readdirSync(dbDir)
  .filter((f) => f.endsWith(".sqlite") && !f.startsWith("metadata"));

if (sqliteFiles.length === 0) {
  console.error("No sqlite file found in", dbDir);
  process.exit(1);
}

const dbPath = path.join(dbDir, sqliteFiles[0]);
console.log("Seeding Schema v2 D1:", dbPath);
const db = new DatabaseSync(dbPath);
const now = Math.floor(Date.now() / 1000);

// 1. Users
const insertUser = db.prepare(`
  INSERT INTO users (id, email, name, role, is_active, created_at)
  VALUES (?, ?, ?, ?, 1, ?)
  ON CONFLICT(id) DO UPDATE SET email = excluded.email, name = excluded.name, role = excluded.role
`);
for (const u of usersSeedData) {
  if (u.role !== "ADMIN" && u.role !== "STAFF") continue;
  insertUser.run(u.id, u.email.toLowerCase(), u.info?.name || u.email, u.role, now);
}

// 2. Services
const categories = galleryExtSeedData.categories ?? [
  "Bảng hiệu & Mặt dựng",
  "Nội thất & Showroom",
];
const insertService = db.prepare(`
  INSERT INTO services (id, slug, name, sort_order)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET name = excluded.name, sort_order = excluded.sort_order
`);
const services = categories.map((name, idx) => ({
  id: `svc-${idx + 1}`,
  slug: slugify(name),
  name,
  sortOrder: idx,
}));
for (const s of services) {
  insertService.run(s.id, s.slug, s.name, s.sortOrder);
}

// 3. Organizations
const insertOrg = db.prepare(`
  INSERT INTO organizations (id, name, slug, description, logo_key, is_featured, featured_order, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET name = excluded.name, description = excluded.description, updated_at = excluded.updated_at
`);
const orgs = (landingSeedData.partnerBrands ?? []).map((p, idx) => ({
  id: `org-${idx + 1}`,
  name: p.name,
  slug: slugify(p.name),
  description: p.category ?? null,
  logoKey: p.logoUrl ?? null,
  featuredOrder: idx,
}));
for (const o of orgs) {
  insertOrg.run(o.id, o.name, o.slug, o.description, o.logoKey, o.featuredOrder, now, now);
}

// 4. Projects, project_services & project_media
const insertProject = db.prepare(`
  INSERT INTO projects (id, slug, title, summary, organization_id, year, publish_status, is_featured, featured_order, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, 'PUBLISHED', 1, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET title = excluded.title, summary = excluded.summary, updated_at = excluded.updated_at
`);
const insertProjectService = db.prepare(`
  INSERT OR IGNORE INTO project_services (project_id, service_id) VALUES (?, ?)
`);
const insertMedia = db.prepare(`
  INSERT INTO project_media (id, project_id, kind, storage_key, alt_text, caption, sort_order, is_cover, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO NOTHING
`);

(landingSeedData.featuredProjects ?? []).forEach((p, idx) => {
  const matchedOrg = orgs.find(
    (o) => p.client && o.name.toLowerCase().includes(p.client.toLowerCase().slice(0, 6))
  );
  const slug = slugify(p.title) || p.id;
  const year = p.year ? Number(p.year) || 2025 : 2025;

  insertProject.run(
    p.id,
    slug,
    p.title,
    p.summary ?? null,
    matchedOrg?.id ?? null,
    year,
    idx,
    now,
    now
  );

  if (services[0]) {
    insertProjectService.run(p.id, services[0].id);
  }
  if (p.coverImage) {
    insertMedia.run(
      `${p.id}-cover`,
      p.id,
      "ACTUAL",
      p.coverImage,
      p.title,
      "Ảnh thực tế công trình",
      0,
      1,
      now
    );
  }
  (p.gallery ?? []).forEach((g, gIdx) => {
    insertMedia.run(
      g.id || `${p.id}-m-${gIdx}`,
      p.id,
      gIdx === 0 ? "RENDER" : "GALLERY",
      g.src,
      p.title,
      g.caption ?? null,
      gIdx + 1,
      0,
      now
    );
  });
});

// 5. Leads
const insertLead = db.prepare(`
  INSERT INTO leads (id, name, email, phone, company_name, service_id, message, budget_range, source, status, created_at, updated_at)
  VALUES (?, ?, ?, ?, NULL, NULL, ?, NULL, 'website', 'NEW', ?, ?)
  ON CONFLICT(id) DO NOTHING
`);
for (const l of leadsSeedData) {
  insertLead.run(
    l.id,
    l.name || l.fullName || "Khách hàng",
    l.email ?? null,
    l.phone,
    l.message ?? null,
    now,
    now
  );
}

// 6. Site Settings
const insertSetting = db.prepare(`
  INSERT INTO site_settings (key, value_json, updated_at)
  VALUES (?, ?, ?)
  ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at
`);
const clusters = services.map((s, idx) => ({
  id: `cluster-${s.slug}`,
  serviceSlug: s.slug,
  title: s.name,
  sortOrder: idx,
  maxItems: 6,
}));
const settings = [
  ["hero_slides", landingSeedData.heroSlides ?? []],
  ["core_disciplines", landingSeedData.coreDisciplines ?? []],
  ["production_divisions", landingSeedData.productionDivisions ?? []],
  ["company_legal_info", landingSeedData.companyLegalInfo ?? {}],
  ["gallery_clusters", clusters],
];
for (const [key, val] of settings) {
  insertSetting.run(key, JSON.stringify(val), now);
}

console.log("Schema v2 D1 seeded successfully!");
