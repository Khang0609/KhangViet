import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const landingSeedData = JSON.parse(
  fs.readFileSync(path.join(rootDir, "packages/data/src/seeds/landing-content.json"), "utf8")
);
const leadsSeedData = JSON.parse(
  fs.readFileSync(path.join(rootDir, "packages/data/src/seeds/leads.json"), "utf8")
);
const usersSeedData = JSON.parse(
  fs.readFileSync(path.join(rootDir, "packages/data/src/seeds/users.json"), "utf8")
);

const dbDir = path.resolve(rootDir, "apps/api/.wrangler/state/v3/d1/miniflare-D1DatabaseObject");
const sqliteFiles = fs.readdirSync(dbDir).filter(f => f.endsWith(".sqlite") && !f.startsWith("metadata"));

if (sqliteFiles.length === 0) {
  console.error("No sqlite file found in", dbDir);
  process.exit(1);
}

const dbPath = path.join(dbDir, sqliteFiles[0]);
console.log("Using DB:", dbPath);
const db = new DatabaseSync(dbPath);

const now = new Date().toISOString();

// 1. Seed Users & Identities
const insertIdentity = db.prepare(`
  INSERT INTO identities (id, full_name, phone, email, identity_type, notes, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    full_name = excluded.full_name,
    phone = excluded.phone,
    email = excluded.email,
    updated_at = excluded.updated_at
`);

const insertUserAccount = db.prepare(`
  INSERT INTO user_accounts (id, identity_id, email, password_hash, role, is_active, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, 1, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    email = excluded.email,
    password_hash = excluded.password_hash,
    role = excluded.role,
    updated_at = excluded.updated_at
`);

for (const user of usersSeedData) {
  const t = user.createdAt || now;
  insertIdentity.run(
    user.id,
    user.info.name,
    user.info.phone,
    user.email,
    "INDIVIDUAL",
    null,
    t,
    user.updatedAt || now
  );

  insertUserAccount.run(
    user.id,
    user.id,
    user.email,
    user.password,
    user.role,
    t,
    user.updatedAt || now
  );
}
console.log(`Seeded ${usersSeedData.length} users & identities.`);

// 2. Seed Leads
const insertLead = db.prepare(`
  INSERT INTO leads (id, identity_id, service_category, project_scale, initial_message, status, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO NOTHING
`);

for (const lead of leadsSeedData) {
  const t = lead.createdAt || now;
  insertIdentity.run(
    lead.id,
    lead.fullName,
    lead.phone,
    lead.email ?? null,
    "INDIVIDUAL",
    lead.notes ?? null,
    t,
    lead.updatedAt || now
  );

  insertLead.run(
    lead.id,
    lead.id,
    lead.serviceCategory ?? null,
    lead.projectScale ?? null,
    lead.message ?? null,
    lead.status,
    t,
    lead.updatedAt || now
  );
}
console.log(`Seeded ${leadsSeedData.length} leads.`);

// 3. Seed Projects & Project Media
const insertProject = db.prepare(`
  INSERT INTO projects (
    id, code, title, subtitle, client, client_identity_id, locations, year, category_tag,
    scale_metric, materials, engineering_notes, summary, cover_image, status, sort_order, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    title = excluded.title,
    subtitle = excluded.subtitle,
    summary = excluded.summary,
    cover_image = excluded.cover_image,
    updated_at = excluded.updated_at
`);

const insertMedia = db.prepare(`
  INSERT INTO project_media (
    id, project_id, media_type, public_url, caption, location, spec, aspect_ratio, sort_order, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO NOTHING
`);

let mediaCount = 0;
for (const p of landingSeedData.featuredProjects) {
  const year = typeof p.year === "number" ? p.year : parseInt(String(p.year), 10) || 2026;
  insertProject.run(
    p.id,
    p.code,
    p.title,
    p.subtitle,
    p.client,
    null,
    JSON.stringify(p.locations),
    year,
    p.categoryTag,
    p.scaleMetric,
    JSON.stringify(p.materials),
    JSON.stringify(p.engineeringNotes),
    p.summary,
    p.coverImage,
    "PUBLISHED",
    0,
    now,
    now
  );

  if (p.gallery && p.gallery.length > 0) {
    for (let i = 0; i < p.gallery.length; i++) {
      const item = p.gallery[i];
      const mediaId = item.id || `media-${p.id}-${i}`;
      insertMedia.run(
        mediaId,
        p.id,
        "GALLERY_IMAGE",
        item.src,
        item.caption || null,
        item.location || null,
        item.spec || null,
        item.aspect || null,
        i,
        now
      );
      mediaCount++;
    }
  }
}
console.log(`Seeded ${landingSeedData.featuredProjects.length} projects and ${mediaCount} media items.`);

// 4. Seed CMS Metadata
const insertCmsMeta = db.prepare(`
  INSERT INTO cms_metadata (key, value_json, updated_at)
  VALUES (?, ?, ?)
  ON CONFLICT(key) DO UPDATE SET
    value_json = excluded.value_json,
    updated_at = excluded.updated_at
`);

insertCmsMeta.run("hero_slides", JSON.stringify(landingSeedData.heroSlides), now);
insertCmsMeta.run("legal_info", JSON.stringify(landingSeedData.companyLegalInfo), now);
console.log("Seeded cms_metadata (hero_slides, legal_info).");

console.log("ALL SEEDING COMPLETED SUCCESSFULLY.");
