import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../../..");

const db = new DatabaseSync(":memory:");
db.exec("PRAGMA foreign_keys = ON;");

const m0 = fs.readFileSync(path.join(root, "packages/repositories/migrations/0000_magenta_midnight.sql"), "utf8");
for (const s of m0.split("--> statement-breakpoint")) {
  if (s.trim()) db.exec(s.trim());
}

const m1 = fs.readFileSync(path.join(root, "packages/repositories/migrations/0001_enterprise_identities_and_media.sql"), "utf8");
for (const s of m1.split("--> statement-breakpoint")) {
  if (s.trim()) db.exec(s.trim());
}

db.exec("PRAGMA foreign_keys = ON;");

db.exec("INSERT INTO identities (id, full_name, phone, created_at, updated_at) VALUES ('id-1', 'Name', '0912345678', '2026', '2026');");

let leadAccepted = false;
try {
  db.exec("INSERT INTO leads (id, identity_id, status, created_at, updated_at) VALUES ('lead-invalid', 'id-1', 'BOGUS_STATUS', '2026', '2026');");
  leadAccepted = true;
} catch (e) {
  console.log("leads rejected status:", e.message);
}

let projectAccepted = false;
try {
  db.exec("INSERT INTO projects (id, code, title, subtitle, client, locations, year, category_tag, scale_metric, materials, engineering_notes, summary, cover_image, status, sort_order, created_at, updated_at) VALUES ('p-invalid', 'code-inv', 'T', 'S', 'C', '[]', 2026, 'Cat', 'Scale', '[]', '[]', 'Sum', 'img', 'BOGUS_STATUS', 0, '2026', '2026');");
  projectAccepted = true;
} catch (e) {
  console.log("projects rejected status:", e.message);
}

let userRoleAccepted = false;
try {
  db.exec("INSERT INTO user_accounts (id, identity_id, email, password_hash, role, is_active, created_at, updated_at) VALUES ('acc-inv', 'id-1', 'test@kv.vn', 'hash', 'BOGUS_ROLE', 1, '2026', '2026');");
  userRoleAccepted = true;
} catch (e) {
  console.log("user_accounts rejected role:", e.message);
}

console.log("Results:", { leadAccepted, projectAccepted, userRoleAccepted });
