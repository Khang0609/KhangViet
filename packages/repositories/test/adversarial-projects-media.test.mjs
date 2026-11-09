/**
 * Adversarial Test Suite for Milestone 1: Projects & Media 3NF Normalization
 * 
 * Verifies:
 * 1. Year Boundary & CHECK Constraints (1989 fails, 1990 passes, 2026 passes, 2100 passes, 2101 fails, negative fails)
 * 2. Code Uniqueness & Index Verification (duplicate code fails, no redundant idx_projects_code index)
 * 3. ON DELETE CASCADE (project deletion purges exactly all associated project_media records)
 * 4. Project Media Metadata & 0-media Edge Cases (0-media returns empty array, null location/spec mapped safely)
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Polyfill / support both better-sqlite3 and native node:sqlite
let Database;
try {
  const betterSqlite = await import("better-sqlite3");
  Database = betterSqlite.default || betterSqlite;
} catch {
  const { DatabaseSync } = await import("node:sqlite");
  Database = DatabaseSync;
}

function createMigratedDatabase() {
  const db = new Database(":memory:");
  db.exec("PRAGMA foreign_keys = ON;");

  // Run migration 0000 (baseline schema)
  const m0Path = path.resolve(__dirname, "../migrations/0000_magenta_midnight.sql");
  const m0 = fs.readFileSync(m0Path, "utf8");
  for (const statement of m0.split("--> statement-breakpoint")) {
    if (statement.trim()) db.exec(statement.trim());
  }

  // Populate legacy baseline project
  db.exec(`
    INSERT INTO projects (
      id, code, title, subtitle, client, locations, year, category_tag,
      scale_metric, materials, engineering_notes, summary, cover_image, gallery
    ) VALUES (
      'p-legacy-001', 'kv-baseline', 'Baseline Project', 'Subtitle', 'Client X',
      '["Hanoi"]', '2024', 'Commercial', '1500m2', '["Glass"]', '["Note"]',
      'Summary baseline', 'cover.webp', '[]'
    );
  `);

  // Run migration 0001 (enterprise identities & 3NF media)
  const m1Path = path.resolve(__dirname, "../migrations/0001_enterprise_identities_and_media.sql");
  const m1 = fs.readFileSync(m1Path, "utf8");
  for (const statement of m1.split("--> statement-breakpoint")) {
    if (statement.trim()) db.exec(statement.trim());
  }

  return db;
}

// -----------------------------------------------------------------------------
// Test Suite 1: Year Boundary & CHECK Constraints
// -----------------------------------------------------------------------------
test("ADVERSARIAL: Year Boundary & CHECK Constraints on projects table", async (t) => {
  const db = createMigratedDatabase();

  await t.test("Subcase 1.1: Inserting project with year = 1989 (< 1990) must fail CHECK constraint", () => {
    assert.throws(
      () => {
        db.exec(`
          INSERT INTO projects (
            id, code, title, subtitle, client, locations, year, category_tag,
            scale_metric, materials, engineering_notes, summary, cover_image,
            status, sort_order, created_at, updated_at
          ) VALUES (
            'p-under-1990', 'kv-code-1989', 'Under Range', 'Sub', 'Client',
            '["Hanoi"]', 1989, 'Hospitality', '800m2', '["Wood"]', '["Notes"]',
            'Summary', 'cover.jpg', 'PUBLISHED', 0, '2026-01-01', '2026-01-01'
          );
        `);
      },
      /CHECK constraint failed/i,
      "Expected SQLite CHECK constraint violation for year = 1989"
    );
  });

  await t.test("Subcase 1.2: Inserting project with year = 1990 (exact lower boundary) must succeed", () => {
    db.exec(`
      INSERT INTO projects (
        id, code, title, subtitle, client, locations, year, category_tag,
        scale_metric, materials, engineering_notes, summary, cover_image,
        status, sort_order, created_at, updated_at
      ) VALUES (
        'p-boundary-1990', 'kv-code-1990', 'Lower Bound', 'Sub', 'Client',
        '["Hanoi"]', 1990, 'Hospitality', '800m2', '["Wood"]', '["Notes"]',
        'Summary', 'cover.jpg', 'PUBLISHED', 0, '2026-01-01', '2026-01-01'
      );
    `);
    const record = db.prepare("SELECT year FROM projects WHERE id = ?").get("p-boundary-1990");
    assert.equal(record.year, 1990);
  });

  await t.test("Subcase 1.3: Inserting project with year = 2026 (nominal year) must succeed", () => {
    db.exec(`
      INSERT INTO projects (
        id, code, title, subtitle, client, locations, year, category_tag,
        scale_metric, materials, engineering_notes, summary, cover_image,
        status, sort_order, created_at, updated_at
      ) VALUES (
        'p-nominal-2026', 'kv-code-2026', 'Nominal Year', 'Sub', 'Client',
        '["HCM"]', 2026, 'Commercial', '1200m2', '["Steel"]', '["Notes"]',
        'Summary', 'cover.jpg', 'PUBLISHED', 0, '2026-01-01', '2026-01-01'
      );
    `);
    const record = db.prepare("SELECT year FROM projects WHERE id = ?").get("p-nominal-2026");
    assert.equal(record.year, 2026);
  });

  await t.test("Subcase 1.4: Inserting project with year = 2100 (exact upper boundary) must succeed", () => {
    db.exec(`
      INSERT INTO projects (
        id, code, title, subtitle, client, locations, year, category_tag,
        scale_metric, materials, engineering_notes, summary, cover_image,
        status, sort_order, created_at, updated_at
      ) VALUES (
        'p-boundary-2100', 'kv-code-2100', 'Upper Bound', 'Sub', 'Client',
        '["Danang"]', 2100, 'Residential', '2000m2', '["Stone"]', '["Notes"]',
        'Summary', 'cover.jpg', 'PUBLISHED', 0, '2026-01-01', '2026-01-01'
      );
    `);
    const record = db.prepare("SELECT year FROM projects WHERE id = ?").get("p-boundary-2100");
    assert.equal(record.year, 2100);
  });

  await t.test("Subcase 1.5: Inserting project with year = 2101 (> 2100) must fail CHECK constraint", () => {
    assert.throws(
      () => {
        db.exec(`
          INSERT INTO projects (
            id, code, title, subtitle, client, locations, year, category_tag,
            scale_metric, materials, engineering_notes, summary, cover_image,
            status, sort_order, created_at, updated_at
          ) VALUES (
            'p-over-2100', 'kv-code-2101', 'Over Range', 'Sub', 'Client',
            '["Danang"]', 2101, 'Residential', '2000m2', '["Stone"]', '["Notes"]',
            'Summary', 'cover.jpg', 'PUBLISHED', 0, '2026-01-01', '2026-01-01'
          );
        `);
      },
      /CHECK constraint failed/i,
      "Expected SQLite CHECK constraint violation for year = 2101"
    );
  });

  await t.test("Subcase 1.6: Inserting project with negative year (-50) must fail CHECK constraint", () => {
    assert.throws(
      () => {
        db.exec(`
          INSERT INTO projects (
            id, code, title, subtitle, client, locations, year, category_tag,
            scale_metric, materials, engineering_notes, summary, cover_image,
            status, sort_order, created_at, updated_at
          ) VALUES (
            'p-negative-year', 'kv-code-neg', 'Negative Year', 'Sub', 'Client',
            '["HCM"]', -50, 'Residential', '500m2', '["Brick"]', '["Notes"]',
            'Summary', 'cover.jpg', 'PUBLISHED', 0, '2026-01-01', '2026-01-01'
          );
        `);
      },
      /CHECK constraint failed/i,
      "Expected SQLite CHECK constraint violation for negative year"
    );
  });

  await t.test("Subcase 1.7: Updating existing valid project to out-of-range year (1988) must fail", () => {
    assert.throws(
      () => {
        db.exec("UPDATE projects SET year = 1988 WHERE id = 'p-nominal-2026';");
      },
      /CHECK constraint failed/i,
      "Expected SQLite CHECK constraint violation on UPDATE year = 1988"
    );
  });

  await t.test("Subcase 1.8: Updating existing valid project to out-of-range year (2105) must fail", () => {
    assert.throws(
      () => {
        db.exec("UPDATE projects SET year = 2105 WHERE id = 'p-nominal-2026';");
      },
      /CHECK constraint failed/i,
      "Expected SQLite CHECK constraint violation on UPDATE year = 2105"
    );
  });

  await t.test("Subcase 1.9: Updating existing valid project to in-range year (2040) must succeed", () => {
    db.exec("UPDATE projects SET year = 2040 WHERE id = 'p-nominal-2026';");
    const updated = db.prepare("SELECT year FROM projects WHERE id = ?").get("p-nominal-2026");
    assert.equal(updated.year, 2040);
  });
});

// -----------------------------------------------------------------------------
// Test Suite 2: Code Uniqueness & Index Verification
// -----------------------------------------------------------------------------
test("ADVERSARIAL: Code Uniqueness & Index Verification", async (t) => {
  const db = createMigratedDatabase();

  await t.test("Subcase 2.1: Duplicate code insertion must fail UNIQUE constraint", () => {
    assert.throws(
      () => {
        db.exec(`
          INSERT INTO projects (
            id, code, title, subtitle, client, locations, year, category_tag,
            scale_metric, materials, engineering_notes, summary, cover_image,
            status, sort_order, created_at, updated_at
          ) VALUES (
            'p-dup-test', 'kv-baseline', 'Duplicate Code', 'Sub', 'Client',
            '["Hanoi"]', 2026, 'Commercial', '1000m2', '["Glass"]', '["Notes"]',
            'Summary', 'cover.jpg', 'PUBLISHED', 0, '2026-01-01', '2026-01-01'
          );
        `);
      },
      /UNIQUE constraint failed/i,
      "Expected UNIQUE constraint violation on duplicate code"
    );
  });

  await t.test("Subcase 2.2: Updating code to collide with another project must fail UNIQUE constraint", () => {
    db.exec(`
      INSERT INTO projects (
        id, code, title, subtitle, client, locations, year, category_tag,
        scale_metric, materials, engineering_notes, summary, cover_image,
        status, sort_order, created_at, updated_at
      ) VALUES (
        'p-unique-002', 'kv-unique-code-02', 'Project Two', 'Sub', 'Client',
        '["HCM"]', 2025, 'Commercial', '1000m2', '["Glass"]', '["Notes"]',
        'Summary', 'cover.jpg', 'PUBLISHED', 0, '2026-01-01', '2026-01-01'
      );
    `);

    assert.throws(
      () => {
        db.exec("UPDATE projects SET code = 'kv-baseline' WHERE id = 'p-unique-002';");
      },
      /UNIQUE constraint failed/i,
      "Expected UNIQUE constraint violation when updating code to an existing value"
    );
  });

  await t.test("Subcase 2.3: SQLite Schema Index Hygiene: single index on code (projects_code_unique)", () => {
    const indexList = db.prepare("PRAGMA index_list('projects')").all();

    // Find all indexes covering the 'code' column
    const codeIndexes = [];
    for (const idx of indexList) {
      const infoList = db.prepare(`PRAGMA index_info('${idx.name}')`).all();
      const hasCode = infoList.some((col) => col.name === "code");
      if (hasCode) {
        codeIndexes.push({
          name: idx.name,
          unique: idx.unique,
          columns: infoList.map((c) => c.name),
        });
      }
    }

    // Assert exactly ONE index exists on the 'code' column
    assert.equal(
      codeIndexes.length,
      1,
      `Expected exactly 1 index covering 'code', found: ${JSON.stringify(codeIndexes)}`
    );

    // Assert that the index is 'projects_code_unique' and is UNIQUE
    assert.equal(codeIndexes[0].name, "projects_code_unique");
    assert.equal(codeIndexes[0].unique, 1, "The single code index must be unique");

    // Explicitly confirm the legacy duplicate non-unique index 'idx_projects_code' does NOT exist
    const legacyIdx = indexList.find((idx) => idx.name === "idx_projects_code");
    assert.equal(
      legacyIdx,
      undefined,
      "Redundant non-unique index 'idx_projects_code' must be purged from schema"
    );
  });
});

// -----------------------------------------------------------------------------
// Test Suite 3: ON DELETE CASCADE
// -----------------------------------------------------------------------------
test("ADVERSARIAL: ON DELETE CASCADE enforcement on project_media", async (t) => {
  const db = createMigratedDatabase();

  await t.test("Subcase 3.1: Create project with 10 media rows, delete project, assert all 10 purged", () => {
    // 1. Create target project
    db.exec(`
      INSERT INTO projects (
        id, code, title, subtitle, client, locations, year, category_tag,
        scale_metric, materials, engineering_notes, summary, cover_image,
        status, sort_order, created_at, updated_at
      ) VALUES (
        'p-cascade-target', 'kv-cascade-01', 'Cascade Target', 'Sub', 'Client',
        '["HCM"]', 2026, 'Commercial', '1000m2', '["Alu"]', '["Notes"]',
        'Summary', 'cover.jpg', 'PUBLISHED', 0, '2026-01-01', '2026-01-01'
      );
    `);

    // 2. Insert 10 media rows for target project
    const insertMediaStmt = db.prepare(`
      INSERT INTO project_media (
        id, project_id, media_type, public_url, caption, location, spec,
        aspect_ratio, width_px, height_px, file_size_bytes, sort_order, created_at
      ) VALUES (
        ?, 'p-cascade-target', 'GALLERY_IMAGE', ?, ?, ?, ?,
        'landscape', 1920, 1080, 150000, ?, '2026-01-01'
      );
    `);

    for (let i = 1; i <= 10; i++) {
      insertMediaStmt.run(
        `media-target-${i}`,
        `https://r2.khangviet.vn/target-${i}.webp`,
        `Caption ${i}`,
        `Location ${i}`,
        `Spec ${i}`,
        i
      );
    }

    // 3. Create control project with 5 media rows
    db.exec(`
      INSERT INTO projects (
        id, code, title, subtitle, client, locations, year, category_tag,
        scale_metric, materials, engineering_notes, summary, cover_image,
        status, sort_order, created_at, updated_at
      ) VALUES (
        'p-cascade-control', 'kv-cascade-ctrl', 'Cascade Control', 'Sub', 'Client',
        '["HCM"]', 2026, 'Commercial', '1000m2', '["Alu"]', '["Notes"]',
        'Summary', 'cover.jpg', 'PUBLISHED', 0, '2026-01-01', '2026-01-01'
      );
    `);

    const insertCtrlMediaStmt = db.prepare(`
      INSERT INTO project_media (
        id, project_id, media_type, public_url, caption, sort_order, created_at
      ) VALUES (
        ?, 'p-cascade-control', 'GALLERY_IMAGE', ?, 'Ctrl Caption', ?, '2026-01-01'
      );
    `);

    for (let i = 1; i <= 5; i++) {
      insertCtrlMediaStmt.run(`media-ctrl-${i}`, `https://r2.khangviet.vn/ctrl-${i}.webp`, i);
    }

    // Verify initial counts
    const targetCountBefore = db
      .prepare("SELECT count(*) as cnt FROM project_media WHERE project_id = 'p-cascade-target'")
      .get().cnt;
    const ctrlCountBefore = db
      .prepare("SELECT count(*) as cnt FROM project_media WHERE project_id = 'p-cascade-control'")
      .get().cnt;

    assert.equal(targetCountBefore, 10, "Target project must have exactly 10 media rows before delete");
    assert.equal(ctrlCountBefore, 5, "Control project must have exactly 5 media rows before delete");

    // 4. Delete target project
    db.exec("DELETE FROM projects WHERE id = 'p-cascade-target';");

    // 5. Empirically verify target media count is now 0 (CASCADE verified)
    const targetCountAfter = db
      .prepare("SELECT count(*) as cnt FROM project_media WHERE project_id = 'p-cascade-target'")
      .get().cnt;
    assert.equal(
      targetCountAfter,
      0,
      "All 10 project_media rows must be automatically deleted by SQLite foreign key CASCADE"
    );

    // 6. Empirically verify control media remains 5 (no collateral deletion)
    const ctrlCountAfter = db
      .prepare("SELECT count(*) as cnt FROM project_media WHERE project_id = 'p-cascade-control'")
      .get().cnt;
    assert.equal(
      ctrlCountAfter,
      5,
      "Control project_media rows must remain intact (5 rows)"
    );
  });

  await t.test("Subcase 3.2: Foreign key RESTRICT on non-existent project_id insertion", () => {
    assert.throws(
      () => {
        db.exec(`
          INSERT INTO project_media (
            id, project_id, media_type, public_url, sort_order, created_at
          ) VALUES (
            'pm-orphan', 'p-non-existent-id', 'GALLERY_IMAGE', 'https://r2.kv.vn/o.webp', 0, '2026-01-01'
          );
        `);
      },
      /FOREIGN KEY constraint failed/i,
      "Expected SQLite FOREIGN KEY constraint violation for non-existent project_id"
    );
  });
});

// -----------------------------------------------------------------------------
// Test Suite 4: Project Media Metadata & 0-media Edge Cases
// -----------------------------------------------------------------------------
test("ADVERSARIAL: Project Media Metadata & 0-media Edge Cases", async (t) => {
  const { mapProjectRecordToFeatured, mapMediaToGalleryItem } = await import(
    "../src/d1/repositories/project-mapper.ts"
  );

  const sampleProjectRecord = {
    id: "p-mapper-test",
    code: "kv-mapper-01",
    title: "Mapper Test Project",
    subtitle: "Subtitle Test",
    client: "Client Mapper",
    clientIdentityId: null,
    locations: ["TP.HCM", "Binh Duong"],
    year: 2026,
    categoryTag: "Commercial",
    scaleMetric: "5000m2",
    materials: ["Glass", "Steel", "Composite"],
    engineeringNotes: ["Note A", "Note B"],
    summary: "Comprehensive test summary",
    coverImage: "https://r2.khangviet.vn/cover.webp",
    status: "PUBLISHED",
    sortOrder: 0,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };

  await t.test("Subcase 4.1: Querying a project with 0 media items returns empty array without throwing", () => {
    // Explicit empty array
    const resultWithEmptyList = mapProjectRecordToFeatured(sampleProjectRecord, []);
    assert.ok(resultWithEmptyList, "FeaturedProject must be created successfully");
    assert.equal(resultWithEmptyList.id, "p-mapper-test");
    assert.equal(resultWithEmptyList.year, "2026", "Integer year must be mapped to string contract");
    assert.ok(Array.isArray(resultWithEmptyList.gallery), "gallery must be an array");
    assert.equal(resultWithEmptyList.gallery.length, 0, "gallery length must be 0");
    assert.deepEqual(resultWithEmptyList.gallery, []);

    // Omitted mediaList parameter (default argument)
    const resultWithOmittedList = mapProjectRecordToFeatured(sampleProjectRecord);
    assert.ok(resultWithOmittedList);
    assert.ok(Array.isArray(resultWithOmittedList.gallery));
    assert.equal(resultWithOmittedList.gallery.length, 0);
    assert.deepEqual(resultWithOmittedList.gallery, []);
  });

  await t.test("Subcase 4.2: Media record with null location, spec, caption, and aspect preserves empty strings without throwing", () => {
    const mediaWithNulls = {
      id: "media-null-props",
      projectId: "p-mapper-test",
      mediaType: "GALLERY_IMAGE",
      r2Key: null,
      publicUrl: "https://r2.khangviet.vn/test-raw.webp",
      caption: null,
      location: null,
      spec: null,
      aspectRatio: null,
      widthPx: null,
      heightPx: null,
      fileSizeBytes: null,
      sortOrder: 0,
      createdAt: "2026-01-01T00:00:00Z",
    };

    const galleryItem = mapMediaToGalleryItem(mediaWithNulls);
    assert.equal(galleryItem.id, "media-null-props");
    assert.equal(galleryItem.src, "https://r2.khangviet.vn/test-raw.webp");
    assert.equal(galleryItem.caption, "", "Null caption must default to empty string");
    assert.equal(galleryItem.location, "", "Null location must default to empty string");
    assert.equal(galleryItem.spec, "", "Null spec must default to empty string");
    assert.equal(galleryItem.aspect, "landscape", "Null aspectRatio must default to 'landscape'");

    // Map through parent project
    const featured = mapProjectRecordToFeatured(sampleProjectRecord, [mediaWithNulls]);
    assert.equal(featured.gallery.length, 1);
    assert.deepEqual(featured.gallery[0], {
      id: "media-null-props",
      src: "https://r2.khangviet.vn/test-raw.webp",
      caption: "",
      location: "",
      spec: "",
      aspect: "landscape",
    });
  });

  await t.test("Subcase 4.3: Media record with rich metadata accurately preserves non-null values", () => {
    const mediaRich = {
      id: "media-rich-props",
      projectId: "p-mapper-test",
      mediaType: "FLOOR_PLAN",
      r2Key: "projects/floor-plan-01.webp",
      publicUrl: "https://r2.khangviet.vn/projects/floor-plan-01.webp",
      caption: "Level 1 Architectural Layout",
      location: "Zone A - South Wing",
      spec: "Anodized Aluminum + Double Glazed Low-E Glass",
      aspectRatio: "portrait",
      widthPx: 1200,
      heightPx: 1600,
      fileSizeBytes: 245000,
      sortOrder: 1,
      createdAt: "2026-01-01T00:00:00Z",
    };

    const galleryItem = mapMediaToGalleryItem(mediaRich);
    assert.equal(galleryItem.id, "media-rich-props");
    assert.equal(galleryItem.src, "https://r2.khangviet.vn/projects/floor-plan-01.webp");
    assert.equal(galleryItem.caption, "Level 1 Architectural Layout");
    assert.equal(galleryItem.location, "Zone A - South Wing");
    assert.equal(galleryItem.spec, "Anodized Aluminum + Double Glazed Low-E Glass");
    assert.equal(galleryItem.aspect, "portrait");
  });

  await t.test("Subcase 4.4: Multi-project grouping simulation with mixed media counts", () => {
    const projects = [
      { ...sampleProjectRecord, id: "proj-0-media", code: "code-0" },
      { ...sampleProjectRecord, id: "proj-2-media", code: "code-2" },
      { ...sampleProjectRecord, id: "proj-1-media", code: "code-1" },
    ];

    const mediaRows = [
      {
        id: "m-p2-1",
        projectId: "proj-2-media",
        mediaType: "GALLERY_IMAGE",
        r2Key: null,
        publicUrl: "https://r2/p2-1.webp",
        caption: "P2 Image 1",
        location: null,
        spec: null,
        aspectRatio: "wide",
        widthPx: 2560,
        heightPx: 1080,
        fileSizeBytes: 300000,
        sortOrder: 0,
        createdAt: "2026-01-01",
      },
      {
        id: "m-p2-2",
        projectId: "proj-2-media",
        mediaType: "GALLERY_IMAGE",
        r2Key: null,
        publicUrl: "https://r2/p2-2.webp",
        caption: "P2 Image 2",
        location: "Roof",
        spec: "Solar Panel",
        aspectRatio: "landscape",
        widthPx: 1920,
        heightPx: 1080,
        fileSizeBytes: 200000,
        sortOrder: 1,
        createdAt: "2026-01-01",
      },
      {
        id: "m-p1-1",
        projectId: "proj-1-media",
        mediaType: "GALLERY_IMAGE",
        r2Key: null,
        publicUrl: "https://r2/p1-1.webp",
        caption: "P1 Single Image",
        location: null,
        spec: null,
        aspectRatio: "portrait",
        widthPx: 1080,
        heightPx: 1920,
        fileSizeBytes: 180000,
        sortOrder: 0,
        createdAt: "2026-01-01",
      },
    ];

    // Reproduce D1CmsProjectRepo.getProjects grouping logic
    const mediaMap = new Map();
    for (const m of mediaRows) {
      const list = mediaMap.get(m.projectId) || [];
      list.push(m);
      mediaMap.set(m.projectId, list);
    }

    const featuredList = projects.map((p) =>
      mapProjectRecordToFeatured(p, mediaMap.get(p.id) || [])
    );

    assert.equal(featuredList.length, 3);

    // Project 0 media
    assert.equal(featuredList[0].id, "proj-0-media");
    assert.equal(featuredList[0].gallery.length, 0);

    // Project 2 media
    assert.equal(featuredList[1].id, "proj-2-media");
    assert.equal(featuredList[1].gallery.length, 2);
    assert.equal(featuredList[1].gallery[0].id, "m-p2-1");
    assert.equal(featuredList[1].gallery[1].id, "m-p2-2");
    assert.equal(featuredList[1].gallery[1].location, "Roof");

    // Project 1 media
    assert.equal(featuredList[2].id, "proj-1-media");
    assert.equal(featuredList[2].gallery.length, 1);
    assert.equal(featuredList[2].gallery[0].id, "m-p1-1");
    assert.equal(featuredList[2].gallery[0].aspect, "portrait");
  });
});
