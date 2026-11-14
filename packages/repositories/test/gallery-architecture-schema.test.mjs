import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function runSqlFile(db, filename) {
  const filePath = path.resolve(__dirname, "../migrations", filename);
  const content = fs.readFileSync(filePath, "utf8");
  for (const stmt of content.split("--> statement-breakpoint")) {
    const trimmed = stmt.trim();
    if (trimmed) db.exec(trimmed);
  }
}

function initFullDatabase() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON;");

  runSqlFile(db, "0000_magenta_midnight.sql");

  // Seed 1 legacy project before running 0001 -> 0003
  db.exec(`
    INSERT INTO projects (
      id, code, title, subtitle, client, locations, year, category_tag,
      scale_metric, materials, engineering_notes, summary, cover_image, gallery
    ) VALUES (
      'p-legacy', 'KV-000', 'Legacy Project', 'Sub', 'Client X', '["HCM"]',
      '2025', 'Bảng hiệu & Mặt dựng', '100m2', '["Inox"]', '["Note"]',
      'Summary', 'cover.jpg', '[]'
    );
  `);

  runSqlFile(db, "0001_enterprise_identities_and_media.sql");
  runSqlFile(db, "0002_motionless_gauntlet.sql");
  runSqlFile(db, "0003_gallery_architecture.sql");

  db.exec("PRAGMA foreign_keys = ON;");
  return db;
}

test("Migration 0003: Transforms projects cleanly & preserves legacy rows", () => {
  const db = initFullDatabase();

  const legacy = db.prepare("SELECT * FROM projects WHERE id = ?").get("p-legacy");
  assert.ok(legacy, "Legacy project must survive migration 0003");
  assert.equal(legacy.segment, "B2B");
  assert.equal(legacy.stage, "COMPLETED");
  assert.equal(legacy.status, undefined, "status column must be removed");
  assert.equal(legacy.sort_order, undefined, "sort_order column must be removed");
});

test("Party Anchor -> Organizations -> Key Accounts: Zero-snapshot JOIN & FK rules", () => {
  const db = initFullDatabase();

  db.exec(`
    INSERT INTO identities (id, full_name, phone, tax_code, identity_type, created_at, updated_at)
    VALUES ('org-bidv', 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)', '19009247', '0100150619', 'ORGANIZATION', '2026-01-01', '2026-01-01');

    INSERT INTO organizations (identity_id, scale, description, logo_url, created_at, updated_at)
    VALUES ('org-bidv', '45+ Điểm giao dịch', 'Hệ thống nhận diện toàn quốc', 'https://cdn.example.com/bidv.svg', '2026-01-01', '2026-01-01');

    INSERT INTO key_accounts (organization_id, slug, tag, sort_order)
    VALUES ('org-bidv', 'bidv', '45+ Chi nhánh & PGD', 1);

    INSERT INTO projects (
      id, code, title, subtitle, client, client_identity_id, key_account_id,
      segment, stage, locations, year, category_tag, scale_metric,
      team_and_timeline, materials, engineering_notes, summary, cover_image,
      created_at, updated_at
    ) VALUES (
      'p-bidv-01', 'KV-001', 'BIDV Chi nhánh Sài Gòn', 'Mặt dựng Alu & Chữ nổi',
      'BIDV', 'org-bidv', 'org-bidv', 'B2B', 'COMPLETED', '["TP.HCM"]', 2026,
      'Bảng hiệu & Mặt dựng', '350m2', 'Tổ Quảng cáo • 12 ngày',
      '["Alu PVDF", "Inox 304"]', '["Chống thấm IP65"]', 'Thi công trọn gói mặt dựng',
      'https://cdn.example.com/bidv-cover.jpg', '2026-01-01', '2026-01-01'
    );
  `);

  // JOIN key_accounts -> organizations -> identities (no snapshot)
  const keyAccount = db.prepare(`
    SELECT ka.organization_id, ka.slug, ka.tag, o.scale, o.logo_url, i.full_name
    FROM key_accounts ka
    JOIN organizations o ON o.identity_id = ka.organization_id
    JOIN identities i ON i.id = o.identity_id
    WHERE ka.slug = ?
  `).get("bidv");

  assert.equal(keyAccount.organization_id, "org-bidv");
  assert.equal(keyAccount.full_name, "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)");
  assert.equal(keyAccount.scale, "45+ Điểm giao dịch");

  // Deleting identity referenced by organizations must fail (RESTRICT)
  assert.throws(
    () => db.exec("DELETE FROM identities WHERE id = 'org-bidv';"),
    /FOREIGN KEY constraint failed/i
  );

  // Duplicate slug on key_accounts must fail (UNIQUE)
  assert.throws(
    () => db.exec(`
      INSERT INTO identities (id, full_name, phone, identity_type, created_at, updated_at)
      VALUES ('org-dup', 'Other Bank', '0901234567', 'ORGANIZATION', '2026-01-01', '2026-01-01');
      INSERT INTO organizations (identity_id, created_at, updated_at) VALUES ('org-dup', '2026-01-01', '2026-01-01');
      INSERT INTO key_accounts (organization_id, slug, tag, sort_order) VALUES ('org-dup', 'bidv', 'Test', 2);
    `),
    /UNIQUE constraint failed/i
  );

  // Deleting key_account sets projects.key_account_id to NULL (ON DELETE SET NULL)
  db.exec("DELETE FROM key_accounts WHERE organization_id = 'org-bidv';");
  const projAfter = db.prepare("SELECT key_account_id FROM projects WHERE id = ?").get("p-bidv-01");
  assert.equal(projAfter.key_account_id, null);
});

test("Project Media, Comparisons & Landing Placements: Constraints and Cascade Delete", () => {
  const db = initFullDatabase();

  db.exec(`
    INSERT INTO projects (
      id, code, title, subtitle, client, segment, stage, locations, year,
      category_tag, scale_metric, materials, engineering_notes, summary,
      cover_image, created_at, updated_at
    ) VALUES (
      'p-01', 'KV-101', 'Showroom X', 'Sub', 'Client X', 'C2B', 'TENDER_3D',
      '["Hà Nội"]', 2026, 'Nội thất & Quầy giao dịch', '120m2', '["Gỗ MDF"]',
      '["LED 4000K"]', 'Thiết kế 3D & thi công', 'cover.jpg', '2026-01-01', '2026-01-01'
    );

    INSERT INTO project_media (id, project_id, media_type, public_url, aspect_ratio, sort_order, created_at)
    VALUES
      ('m-3d', 'p-01', 'RENDER_3D', 'https://cdn.example.com/3d.jpg', '16/10', 0, '2026-01-01'),
      ('m-act', 'p-01', 'ACTUAL', 'https://cdn.example.com/actual.jpg', '16/10', 1, '2026-01-01');

    INSERT INTO project_comparisons (id, project_id, label, render_media_id, actual_media_id, aspect_ratio, sort_order)
    VALUES ('cmp-01', 'p-01', 'Mặt tiền chính', 'm-3d', 'm-act', '16/10', 0);

    INSERT INTO landing_placements (id, slot_type, project_id, sort_order, custom_meta, created_at, updated_at)
    VALUES ('lp-01', 'HERO_SLIDE', 'p-01', 1, '{"lightingMode":"DAYLIGHT"}', '2026-01-01', '2026-01-01');
  `);

  // Reject invalid CHECK constraints
  assert.throws(
    () => db.exec(`
      INSERT INTO projects (
        id, code, title, subtitle, client, segment, stage, locations, year,
        category_tag, scale_metric, materials, engineering_notes, summary,
        cover_image, created_at, updated_at
      ) VALUES (
        'p-bad', 'KV-BAD', 'Bad', 'Sub', 'Client', 'B2G', 'COMPLETED', '[]', 2026,
        'Cat', '10m2', '[]', '[]', 'Sum', 'c.jpg', '2026-01-01', '2026-01-01'
      );
    `),
    /CHECK constraint failed/i
  );

  assert.throws(
    () => db.exec(`
      INSERT INTO landing_placements (id, slot_type, project_id, sort_order, created_at, updated_at)
      VALUES ('lp-dup', 'HERO_SLIDE', 'p-01', 2, '2026-01-01', '2026-01-01');
    `),
    /UNIQUE constraint failed/i
  );

  // Deleting project cascades to media, comparisons, and landing_placements
  db.exec("DELETE FROM projects WHERE id = 'p-01';");
  assert.equal(db.prepare("SELECT COUNT(*) as cnt FROM project_media WHERE project_id = 'p-01'").get().cnt, 0);
  assert.equal(db.prepare("SELECT COUNT(*) as cnt FROM project_comparisons WHERE project_id = 'p-01'").get().cnt, 0);
  assert.equal(db.prepare("SELECT COUNT(*) as cnt FROM landing_placements WHERE project_id = 'p-01'").get().cnt, 0);
});

test("Query Plans: Gallery filter & Landing placements use Indexes", () => {
  const db = initFullDatabase();

  const galleryPlan = db.prepare(`
    EXPLAIN QUERY PLAN
    SELECT id, code, title FROM projects
    WHERE segment = 'B2B' AND stage = 'COMPLETED' AND category_tag = 'Bảng hiệu & Mặt dựng'
  `).all();
  const galleryDetail = galleryPlan.map((r) => r.detail).join(" ");
  assert.match(galleryDetail, /idx_projects_gallery_filter/, "Gallery filter must use composite index");

  const landingPlan = db.prepare(`
    EXPLAIN QUERY PLAN
    SELECT lp.project_id, p.title FROM landing_placements lp
    JOIN projects p ON p.id = lp.project_id
    WHERE lp.slot_type = 'HERO_SLIDE'
    ORDER BY lp.sort_order ASC
  `).all();
  const landingDetail = landingPlan.map((r) => r.detail).join(" ");
  assert.match(landingDetail, /idx_landing_placements_slot/, "Landing placement query must use slot index");
});
