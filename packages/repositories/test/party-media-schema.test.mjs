import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function initMigratedDatabase() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON;");

  const m0Path = path.resolve(__dirname, "../migrations/0000_magenta_midnight.sql");
  const m0 = fs.readFileSync(m0Path, "utf8");
  for (const s of m0.split("--> statement-breakpoint")) {
    if (s.trim()) db.exec(s.trim());
  }

  // Insert test data in 0000 schema
  db.exec(`
    INSERT INTO users (id, email, password, role, name, phone, created_at, updated_at)
    VALUES ('u-001', 'admin@khangviet.vn', 'hash_admin', 'ADMIN', 'Tran Xuan Dong', '0903680449', '2026-01-01', '2026-01-01');
    INSERT INTO leads (id, full_name, phone, email, service_category, project_scale, message, status, notes, created_at, updated_at)
    VALUES ('l-001', 'Nguyen Van Khach', '0987654321', 'khach@example.com', 'Facade', '>100m2', 'Need quotation', 'NEW', 'VIP lead', '2026-01-01', '2026-01-01');
    INSERT INTO projects (id, code, title, subtitle, client, locations, year, category_tag, scale_metric, materials, engineering_notes, summary, cover_image, gallery)
    VALUES ('p-001', 'kv-project-01', 'Project 01', 'Sub 01', 'Client A', '["HCM"]', '2026', 'Commercial', '500m2', '["Steel"]', '["Note"]', 'Summary', 'cover.jpg', '[]');
  `);

  // Run migration 0001
  const m1Path = path.resolve(__dirname, "../migrations/0001_enterprise_identities_and_media.sql");
  const m1 = fs.readFileSync(m1Path, "utf8");
  for (const s of m1.split("--> statement-breakpoint")) {
    if (s.trim()) db.exec(s.trim());
  }

  return db;
}

test("Migration 0001: Safely transforms legacy tables to Enterprise Party & 3NF schema", () => {
  const db = initMigratedDatabase();

  const identity = db.prepare("SELECT * FROM identities WHERE id = ?").get("u-001");
  assert.ok(identity, "User must be migrated into identities");
  assert.equal(identity.full_name, "Tran Xuan Dong");
  assert.equal(identity.phone, "0903680449");
  assert.equal(identity.identity_type, "INDIVIDUAL");

  const account = db.prepare("SELECT * FROM user_accounts WHERE id = ?").get("u-001");
  assert.ok(account, "User account must be migrated");
  assert.equal(account.identity_id, "u-001");
  assert.equal(account.email, "admin@khangviet.vn");
  assert.equal(account.role, "ADMIN");
  assert.equal(account.is_active, 1);

  const lead = db.prepare("SELECT * FROM leads WHERE id = ?").get("l-001");
  assert.ok(lead, "Lead must be migrated");
  assert.equal(lead.identity_id, "l-001");
  assert.equal(lead.service_category, "Facade");

  const project = db.prepare("SELECT * FROM projects WHERE id = ?").get("p-001");
  assert.ok(project, "Project must be migrated");
  assert.equal(typeof project.year, "number", "Year must be converted to integer");
  assert.equal(project.year, 2026);
  assert.equal(project.status, "PUBLISHED");
  assert.equal(project.gallery, undefined, "gallery JSON column must be removed");
});

test("Party Model: Foreign key RESTRICT prevents orphaned user accounts", () => {
  const db = initMigratedDatabase();
  db.exec("PRAGMA foreign_keys = ON;");

  // Attempt to delete identity while user_account references it
  assert.throws(
    () => db.exec("DELETE FROM identities WHERE id = 'u-001';"),
    /FOREIGN KEY constraint failed/i,
    "Should reject deleting identity referenced by user_accounts (RESTRICT)"
  );
});

test("CRM Model: Foreign key RESTRICT prevents orphaned leads", () => {
  const db = initMigratedDatabase();
  db.exec("PRAGMA foreign_keys = ON;");

  assert.throws(
    () => db.exec("DELETE FROM identities WHERE id = 'l-001';"),
    /FOREIGN KEY constraint failed/i,
    "Should reject deleting identity referenced by leads (RESTRICT)"
  );
});

test("Auth & Projects: Unique constraints are strictly enforced", () => {
  const db = initMigratedDatabase();
  db.exec("PRAGMA foreign_keys = ON;");

  // Duplicate email on user_accounts
  assert.throws(
    () => db.exec(`
      INSERT INTO user_accounts (id, identity_id, email, password_hash, role, is_active, created_at, updated_at)
      VALUES ('u-dup', 'l-001', 'admin@khangviet.vn', 'hash', 'CUSTOMER', 1, '2026-01-01', '2026-01-01');
    `),
    /UNIQUE constraint failed/i,
    "user_accounts email must be unique"
  );

  // Duplicate code on projects
  assert.throws(
    () => db.exec(`
      INSERT INTO projects (id, code, title, subtitle, client, locations, year, category_tag, scale_metric, materials, engineering_notes, summary, cover_image, status, sort_order, created_at, updated_at)
      VALUES ('p-dup', 'kv-project-01', 'Dup', 'Sub', 'Client', '[]', 2026, 'Cat', 'Scale', '[]', '[]', 'Sum', 'img.jpg', 'PUBLISHED', 0, '2026-01-01', '2026-01-01');
    `),
    /UNIQUE constraint failed/i,
    "projects code must be unique"
  );
});

test("Projects: Year check constraint (1990 <= year <= 2100) is enforced", () => {
  const db = initMigratedDatabase();
  db.exec("PRAGMA foreign_keys = ON;");

  // Year < 1990
  assert.throws(
    () => db.exec(`
      INSERT INTO projects (id, code, title, subtitle, client, locations, year, category_tag, scale_metric, materials, engineering_notes, summary, cover_image, status, sort_order, created_at, updated_at)
      VALUES ('p-old', 'kv-project-old', 'Old', 'Sub', 'Client', '[]', 1980, 'Cat', 'Scale', '[]', '[]', 'Sum', 'img.jpg', 'PUBLISHED', 0, '2026-01-01', '2026-01-01');
    `),
    /CHECK constraint failed/i,
    "Year below 1990 must fail CHECK constraint"
  );

  // Year > 2100
  assert.throws(
    () => db.exec(`
      INSERT INTO projects (id, code, title, subtitle, client, locations, year, category_tag, scale_metric, materials, engineering_notes, summary, cover_image, status, sort_order, created_at, updated_at)
      VALUES ('p-future', 'kv-project-future', 'Future', 'Sub', 'Client', '[]', 2150, 'Cat', 'Scale', '[]', '[]', 'Sum', 'img.jpg', 'PUBLISHED', 0, '2026-01-01', '2026-01-01');
    `),
    /CHECK constraint failed/i,
    "Year above 2100 must fail CHECK constraint"
  );
});

test("3NF Project Media & Lead Activities: CASCADE DELETE is functional", () => {
  const db = initMigratedDatabase();
  db.exec("PRAGMA foreign_keys = ON;");

  // Insert project media
  db.exec(`
    INSERT INTO project_media (id, project_id, media_type, public_url, caption, sort_order, created_at)
    VALUES ('m-001', 'p-001', 'GALLERY_IMAGE', 'https://r2.khangviet.vn/img1.webp', 'Photo 1', 0, '2026-01-01');
    INSERT INTO project_media (id, project_id, media_type, public_url, caption, sort_order, created_at)
    VALUES ('m-002', 'p-001', 'FLOOR_PLAN', 'https://r2.khangviet.vn/plan.webp', 'Floor Plan', 1, '2026-01-01');
  `);

  const mediaBefore = db.prepare("SELECT count(*) as count FROM project_media WHERE project_id = 'p-001'").get();
  assert.equal(mediaBefore.count, 2);

  // Delete project -> should cascade delete project_media
  db.exec("DELETE FROM projects WHERE id = 'p-001';");
  const mediaAfter = db.prepare("SELECT count(*) as count FROM project_media WHERE project_id = 'p-001'").get();
  assert.equal(mediaAfter.count, 0, "project_media must be cascade-deleted when project is deleted");

  // Insert lead activities
  db.exec(`
    INSERT INTO lead_activities (id, lead_id, staff_identity_id, action_type, content, created_at)
    VALUES ('act-001', 'l-001', 'u-001', 'CALL', 'Called customer for initial survey', '2026-01-01');
  `);

  const actBefore = db.prepare("SELECT count(*) as count FROM lead_activities WHERE lead_id = 'l-001'").get();
  assert.equal(actBefore.count, 1);

  // Delete lead -> should cascade delete lead_activities
  db.exec("DELETE FROM leads WHERE id = 'l-001';");
  const actAfter = db.prepare("SELECT count(*) as count FROM lead_activities WHERE lead_id = 'l-001'").get();
  assert.equal(actAfter.count, 0, "lead_activities must be cascade-deleted when lead is deleted");
});

test("SET NULL on staff_identity_id when staff identity is deleted", () => {
  const db = initMigratedDatabase();
  db.exec("PRAGMA foreign_keys = ON;");

  // Create temporary staff identity and lead activity
  db.exec(`
    INSERT INTO identities (id, full_name, phone, identity_type, created_at, updated_at)
    VALUES ('staff-temp', 'Temporary Staff', '0901112233', 'INDIVIDUAL', '2026-01-01', '2026-01-01');
    INSERT INTO lead_activities (id, lead_id, staff_identity_id, action_type, content, created_at)
    VALUES ('act-staff', 'l-001', 'staff-temp', 'NOTE', 'Survey completed', '2026-01-01');
  `);

  // Delete staff-temp (not referenced by user_accounts, so can be deleted)
  db.exec("DELETE FROM identities WHERE id = 'staff-temp';");

  const act = db.prepare("SELECT * FROM lead_activities WHERE id = 'act-staff'").get();
  assert.equal(act.staff_identity_id, null, "staff_identity_id must be set to NULL upon deleting staff");
});

test("Repository Adapters: Backward compatibility data contracts", async () => {
  const { mapToContactLead } = await import("../src/d1/repositories/lead-mapper.ts");
  const { mapProjectRecordToFeatured } = await import("../src/d1/repositories/project-mapper.ts");

  // Verify Lead Mapper
  const contactLead = mapToContactLead({
    id: "lead-123",
    identityId: "ident-123",
    fullName: "Le Van Cuong",
    phone: "0901234567",
    email: "cuong@kv.vn",
    serviceCategory: "Facade",
    projectScale: "500m2",
    initialMessage: "Tu van gap",
    status: "NEW",
    notes: "Notes from identity",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  });

  assert.equal(contactLead.id, "lead-123");
  assert.equal(contactLead.fullName, "Le Van Cuong");
  assert.equal(contactLead.phone, "0901234567");
  assert.equal(contactLead.email, "cuong@kv.vn");
  assert.equal(contactLead.message, "Tu van gap");
  assert.equal(contactLead.notes, "Notes from identity");

  // Verify Project Mapper with Media
  const featured = mapProjectRecordToFeatured(
    {
      id: "p-test",
      code: "kv-test",
      title: "Test Project",
      subtitle: "Sub Test",
      client: "Client Test",
      clientIdentityId: null,
      locations: ["TP.HCM"],
      year: 2026,
      categoryTag: "Commercial",
      scaleMetric: "1000m2",
      materials: ["Aluminum"],
      engineeringNotes: ["Note 1"],
      summary: "Summary test",
      coverImage: "cover.jpg",
      status: "PUBLISHED",
      sortOrder: 0,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    },
    [
      {
        id: "m-1",
        projectId: "p-test",
        mediaType: "GALLERY_IMAGE",
        r2Key: "img1.webp",
        publicUrl: "https://r2.khangviet.vn/img1.webp",
        caption: "Main Facade",
        location: "Khu A",
        spec: "Alu 3mm",
        aspectRatio: "landscape",
        widthPx: 1920,
        heightPx: 1080,
        fileSizeBytes: 204800,
        sortOrder: 0,
        createdAt: "2026-01-01",
      },
    ]
  );

  assert.equal(featured.id, "p-test");
  assert.equal(featured.year, "2026", "Year must be mapped to string for FeaturedProject contract");
  assert.equal(featured.gallery.length, 1);
  assert.equal(featured.gallery[0].src, "https://r2.khangviet.vn/img1.webp");
  assert.equal(featured.gallery[0].caption, "Main Facade");
  assert.equal(featured.gallery[0].location, "Khu A");
  assert.equal(featured.gallery[0].spec, "Alu 3mm");
  assert.equal(featured.gallery[0].aspect, "landscape");
});

