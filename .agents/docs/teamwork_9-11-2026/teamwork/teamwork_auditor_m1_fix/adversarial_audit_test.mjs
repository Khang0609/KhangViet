import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";

console.log("=== RUNNING INDEPENDENT ADVERSARIAL INTEGRITY TEST ===");

const db = new DatabaseSync(":memory:");
db.exec("PRAGMA foreign_keys = ON;");

// Apply m0
const m0 = fs.readFileSync("packages/repositories/migrations/0000_magenta_midnight.sql", "utf8");
for (const s of m0.split("--> statement-breakpoint")) {
  if (s.trim()) db.exec(s.trim());
}

// Seed legacy user
db.exec(`
  INSERT INTO users (id, email, password, role, name, phone, created_at, updated_at)
  VALUES ('u-root', 'root@corp.vn', 'hash_pw', 'ADMIN', 'CEO', '0999888777', '2026-01-01', '2026-01-01');
`);

// Apply m1
const m1 = fs.readFileSync("packages/repositories/migrations/0001_enterprise_identities_and_media.sql", "utf8");
for (const s of m1.split("--> statement-breakpoint")) {
  if (s.trim()) db.exec(s.trim());
}
db.exec("PRAGMA foreign_keys = ON;");

console.log("1. Testing user_accounts invalid role rejection...");
assert.throws(
  () => {
    db.exec("INSERT INTO user_accounts (id, identity_id, email, password_hash, role, is_active, created_at, updated_at) VALUES ('a-bad', 'u-root', 'bad@test.com', 'hash', 'HACKER', 1, '2026-01-01', '2026-01-01');");
  },
  /CHECK constraint failed/i
);
console.log("-> PASS: HACKER role rejected by SQLite CHECK constraint.");

console.log("2. Testing leads invalid status rejection...");
assert.throws(
  () => {
    db.exec("INSERT INTO leads (id, identity_id, status, created_at, updated_at) VALUES ('l-bad', 'u-root', 'PENDING_APPROVAL', '2026-01-01', '2026-01-01');");
  },
  /CHECK constraint failed/i
);
console.log("-> PASS: PENDING_APPROVAL lead status rejected by SQLite CHECK constraint.");

console.log("3. Testing projects year boundaries (1980 and 2150)...");
assert.throws(
  () => {
    db.exec("INSERT INTO projects (id, code, title, subtitle, client, locations, year, category_tag, scale_metric, materials, engineering_notes, summary, cover_image, status, sort_order, created_at, updated_at) VALUES ('p-bad-yr1', 'kv-bad1', 'T', 'S', 'C', '[]', 1980, 'Cat', '10m', '[]', '[]', 'Sum', 'img.png', 'PUBLISHED', 0, '2026-01-01', '2026-01-01');");
  },
  /CHECK constraint failed/i
);
assert.throws(
  () => {
    db.exec("INSERT INTO projects (id, code, title, subtitle, client, locations, year, category_tag, scale_metric, materials, engineering_notes, summary, cover_image, status, sort_order, created_at, updated_at) VALUES ('p-bad-yr2', 'kv-bad2', 'T', 'S', 'C', '[]', 2150, 'Cat', '10m', '[]', '[]', 'Sum', 'img.png', 'PUBLISHED', 0, '2026-01-01', '2026-01-01');");
  },
  /CHECK constraint failed/i
);
console.log("-> PASS: Out-of-range years rejected by SQLite CHECK constraint.");

console.log("4. Testing projects status check rejection...");
assert.throws(
  () => {
    db.exec("INSERT INTO projects (id, code, title, subtitle, client, locations, year, category_tag, scale_metric, materials, engineering_notes, summary, cover_image, status, sort_order, created_at, updated_at) VALUES ('p-bad-st', 'kv-bad3', 'T', 'S', 'C', '[]', 2026, 'Cat', '10m', '[]', '[]', 'Sum', 'img.png', 'DELETED', 0, '2026-01-01', '2026-01-01');");
  },
  /CHECK constraint failed/i
);
console.log("-> PASS: DELETED project status rejected by SQLite CHECK constraint.");

console.log("5. Testing ON DELETE RESTRICT on identity with user_accounts...");
assert.throws(
  () => {
    db.exec("DELETE FROM identities WHERE id = 'u-root';");
  },
  /FOREIGN KEY constraint failed/i
);
console.log("-> PASS: Deletion of parent identity blocked by RESTRICT.");

console.log("=== ALL 5 ADVERSARIAL STRESS TESTS PASSED EMPIRICALLY ===");
