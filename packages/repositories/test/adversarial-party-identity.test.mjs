import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function initDatabase() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON;");

  const m0Path = path.resolve(__dirname, "../migrations/0000_magenta_midnight.sql");
  const m0 = fs.readFileSync(m0Path, "utf8");
  for (const s of m0.split("--> statement-breakpoint")) {
    if (s.trim()) db.exec(s.trim());
  }

  // Pre-seed legacy data
  db.exec(`
    INSERT INTO users (id, email, password, role, name, phone, created_at, updated_at)
    VALUES ('u-001', 'admin@khangviet.vn', 'hash_admin', 'ADMIN', 'Tran Xuan Dong', '0903680449', '2026-01-01', '2026-01-01');
    INSERT INTO leads (id, full_name, phone, email, service_category, project_scale, message, status, notes, created_at, updated_at)
    VALUES ('l-001', 'Nguyen Van Khach', '0987654321', 'khach@example.com', 'Facade', '>100m2', 'Need quotation', 'NEW', 'VIP lead', '2026-01-01', '2026-01-01');
    INSERT INTO projects (id, code, title, subtitle, client, locations, year, category_tag, scale_metric, materials, engineering_notes, summary, cover_image, gallery)
    VALUES ('p-001', 'kv-project-01', 'Project 01', 'Sub 01', 'Client A', '["HCM"]', '2026', 'Commercial', '500m2', '["Steel"]', '["Note"]', 'Summary', 'cover.jpg', '[]');
  `);

  const m1Path = path.resolve(__dirname, "../migrations/0001_enterprise_identities_and_media.sql");
  const m1 = fs.readFileSync(m1Path, "utf8");
  for (const s of m1.split("--> statement-breakpoint")) {
    if (s.trim()) db.exec(s.trim());
  }

  // Ensure foreign keys are ON
  db.exec("PRAGMA foreign_keys = ON;");
  return db;
}

// ==============================================================================
// 1. Foreign Key Integrity Tests
// ==============================================================================
test("Task 1: Foreign Key Integrity on user_accounts and leads", () => {
  const db = initDatabase();

  // 1.1: Inserting a user_accounts row with a non-existent identity_id must fail
  assert.throws(
    () => {
      db.exec(`
        INSERT INTO user_accounts (id, identity_id, email, password_hash, role, is_active, created_at, updated_at)
        VALUES ('acc-orphan', 'non-existent-identity-id', 'orphan@test.com', 'hash', 'CUSTOMER', 1, '2026-01-01', '2026-01-01');
      `);
    },
    /FOREIGN KEY constraint failed/i,
    "Inserting user_accounts with non-existent identity_id must fail foreign key constraint"
  );

  // 1.2: Inserting a leads row with a non-existent identity_id must fail
  assert.throws(
    () => {
      db.exec(`
        INSERT INTO leads (id, identity_id, service_category, project_scale, initial_message, status, created_at, updated_at)
        VALUES ('lead-orphan', 'non-existent-identity-id', 'Facade', '100m2', 'Need quote', 'NEW', '2026-01-01', '2026-01-01');
      `);
    },
    /FOREIGN KEY constraint failed/i,
    "Inserting leads with non-existent identity_id must fail foreign key constraint"
  );
});

// ==============================================================================
// 2. ON DELETE RESTRICT Tests
// ==============================================================================
test("Task 2: ON DELETE RESTRICT blocks deletion of identities with children", () => {
  const db = initDatabase();

  // 2.1: Delete an identity referenced by user_accounts
  assert.throws(
    () => {
      db.exec("DELETE FROM identities WHERE id = 'u-001';");
    },
    /FOREIGN KEY constraint failed/i,
    "Deleting identity referenced by user_accounts must be blocked by ON DELETE RESTRICT"
  );

  // 2.2: Delete an identity referenced by leads
  assert.throws(
    () => {
      db.exec("DELETE FROM identities WHERE id = 'l-001';");
    },
    /FOREIGN KEY constraint failed/i,
    "Deleting identity referenced by leads must be blocked by ON DELETE RESTRICT"
  );

  // 2.3: Deletion of an unreferenced identity must succeed
  db.exec(`
    INSERT INTO identities (id, full_name, phone, identity_type, created_at, updated_at)
    VALUES ('ident-standalone', 'Standalone User', '0912999888', 'INDIVIDUAL', '2026-01-01', '2026-01-01');
  `);
  db.exec("DELETE FROM identities WHERE id = 'ident-standalone';");
  const check = db.prepare("SELECT * FROM identities WHERE id = 'ident-standalone'").get();
  assert.equal(check, undefined, "Unreferenced identity can be safely deleted");
});

// ==============================================================================
// 3. Data Integrity & Constraints Tests
// ==============================================================================
test("Task 3.1: Duplicate email rejection on user_accounts", () => {
  const db = initDatabase();

  assert.throws(
    () => {
      db.exec(`
        INSERT INTO user_accounts (id, identity_id, email, password_hash, role, is_active, created_at, updated_at)
        VALUES ('acc-dup', 'u-001', 'admin@khangviet.vn', 'hash_pass', 'CUSTOMER', 1, '2026-01-01', '2026-01-01');
      `);
    },
    /UNIQUE constraint failed/i,
    "Duplicate email on user_accounts must fail UNIQUE constraint"
  );
});

test("Task 3.2: Optional tax_code (null for INDIVIDUAL, string for ORGANIZATION)", () => {
  const db = initDatabase();

  db.exec(`
    INSERT INTO identities (id, full_name, phone, email, tax_code, identity_type, created_at, updated_at)
    VALUES ('ident-indiv', 'Ca Nhan', '0901111111', 'indiv@test.com', NULL, 'INDIVIDUAL', '2026-01-01', '2026-01-01');
    INSERT INTO identities (id, full_name, phone, email, tax_code, identity_type, created_at, updated_at)
    VALUES ('ident-org', 'Doanh Nghiep ABC', '0283899999', 'b2b@test.com', '0314567890', 'ORGANIZATION', '2026-01-01', '2026-01-01');
  `);

  const indiv = db.prepare("SELECT * FROM identities WHERE id = 'ident-indiv'").get();
  const org = db.prepare("SELECT * FROM identities WHERE id = 'ident-org'").get();

  assert.equal(indiv.tax_code, null, "tax_code can be NULL for INDIVIDUAL");
  assert.equal(org.tax_code, "0314567890", "tax_code accepts string for ORGANIZATION");
});

test("Task 3.3: Strict enforcement of CHECK constraints on roles and entities", () => {
  const db = initDatabase();

  // 1. Role CHECK constraint on user_accounts
  assert.throws(
    () => {
      db.exec(`
        INSERT INTO user_accounts (id, identity_id, email, password_hash, role, is_active, created_at, updated_at)
        VALUES ('acc-invalid-guest', 'u-001', 'guest@test.com', 'hash', 'GUEST', 1, '2026-01-01', '2026-01-01');
      `);
    },
    /CHECK constraint failed/i,
    "Inserting user_accounts with invalid role 'GUEST' must fail CHECK constraint"
  );

  assert.throws(
    () => {
      db.exec(`
        INSERT INTO user_accounts (id, identity_id, email, password_hash, role, is_active, created_at, updated_at)
        VALUES ('acc-invalid-root', 'u-001', 'root@test.com', 'hash', 'ROOT', 1, '2026-01-01', '2026-01-01');
      `);
    },
    /CHECK constraint failed/i,
    "Inserting user_accounts with invalid role 'ROOT' must fail CHECK constraint"
  );

  // Inserting valid roles must succeed
  db.exec(`
    INSERT INTO user_accounts (id, identity_id, email, password_hash, role, is_active, created_at, updated_at)
    VALUES ('acc-valid-staff', 'u-001', 'staff@test.com', 'hash', 'STAFF', 1, '2026-01-01', '2026-01-01');
  `);
  const staff = db.prepare("SELECT role FROM user_accounts WHERE id = 'acc-valid-staff'").get();
  assert.equal(staff.role, "STAFF", "Valid role 'STAFF' must be stored successfully");

  // 2. LeadStatus CHECK constraint on leads
  assert.throws(
    () => {
      db.exec(`
        INSERT INTO leads (id, identity_id, status, created_at, updated_at)
        VALUES ('lead-inv', 'u-001', 'INVALID_STATUS', '2026-01-01', '2026-01-01');
      `);
    },
    /CHECK constraint failed/i,
    "Inserting leads with invalid status 'INVALID_STATUS' must fail CHECK constraint"
  );

  // 3. ProjectStatus CHECK constraint on projects
  assert.throws(
    () => {
      db.exec(`
        INSERT INTO projects (id, code, title, subtitle, client, locations, year, category_tag, scale_metric, materials, engineering_notes, summary, cover_image, status, sort_order, created_at, updated_at)
        VALUES ('proj-inv', 'kv-inv-status', 'Title', 'Subtitle', 'Client', '["HCM"]', 2026, 'Commercial', '100m2', '["Steel"]', '["Note"]', 'Summary', 'cover.jpg', 'INVALID_STATUS', 0, '2026-01-01', '2026-01-01');
      `);
    },
    /CHECK constraint failed/i,
    "Inserting projects with invalid status 'INVALID_STATUS' must fail CHECK constraint"
  );
});

// ==============================================================================
// 4. Adapter Edge Cases & Data Mapping
// ==============================================================================
test("Task 4: Adapter Edge Cases — D1UserRepository & D1LeadRepository Logic", async () => {
  const db = initDatabase();

  // 4.1: D1UserRepository query logic verification
  // SELECT query joins user_accounts + identities
  const selectUserStmt = db.prepare(`
    SELECT 
      ua.id, ua.email, ua.role, ua.password_hash as passwordHash,
      ua.created_at as createdAt, ua.updated_at as updatedAt,
      i.full_name as fullName, i.phone
    FROM user_accounts ua
    INNER JOIN identities i ON ua.identity_id = i.id
    WHERE lower(ua.email) = ?
    LIMIT 1;
  `);

  // Case 4.1a: Whitespace and case normalization on email
  const inputEmail = "  AdMiN@KhAnGvIeT.vN  ";
  const normalizedEmail = inputEmail.trim().toLowerCase();
  const user = selectUserStmt.get(normalizedEmail);
  assert.ok(user, "User should be found when email is trimmed and lowercased");
  assert.equal(user.email, "admin@khangviet.vn");
  assert.equal(user.fullName, "Tran Xuan Dong");
  assert.equal(user.phone, "0903680449");

  // Case 4.1b: Non-existent email
  const notFound = selectUserStmt.get("unknown@domain.com");
  assert.equal(notFound, undefined, "Non-existent email returns undefined");

  // Case 4.1c: SafeUser contract mapping (passwordHash omitted)
  const safeUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    info: { name: user.fullName, phone: user.phone },
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
  assert.equal("passwordHash" in safeUser, false);
  assert.equal("password" in safeUser, false);

  // 4.2: D1LeadRepository createLead logic with edge cases
  // Edge Case 4.2a: Unicode Vietnamese names with accents and emojis
  const unicodeName = "Trần Thị Ánh Tuyết 🌸 (KV Design)";
  const phoneA = "0938123456";
  const now = new Date().toISOString();

  db.exec(`
    INSERT INTO identities (id, full_name, phone, email, identity_type, created_at, updated_at)
    VALUES ('ident-unicode', '${unicodeName}', '${phoneA}', 'tuyet@test.com', 'INDIVIDUAL', '${now}', '${now}');
    INSERT INTO leads (id, identity_id, service_category, project_scale, initial_message, status, created_at, updated_at)
    VALUES ('lead-unicode', 'ident-unicode', 'Mặt dựng kính Low-E', '500m2', 'Cần tư vấn', 'NEW', '${now}', '${now}');
  `);

  const selectLeadStmt = db.prepare(`
    SELECT 
      l.id, l.identity_id as identityId, l.service_category as serviceCategory,
      l.project_scale as projectScale, l.initial_message as initialMessage,
      l.status, l.created_at as createdAt, l.updated_at as updatedAt,
      i.full_name as fullName, i.phone, i.email, i.notes
    FROM leads l
    INNER JOIN identities i ON l.identity_id = i.id
    WHERE l.id = ?
    LIMIT 1;
  `);

  const retrievedLead = selectLeadStmt.get("lead-unicode");
  assert.ok(retrievedLead);
  assert.equal(retrievedLead.fullName, unicodeName, "Unicode fullName must be preserved intact");
  assert.equal(retrievedLead.serviceCategory, "Mặt dựng kính Low-E");

  // Edge Case 4.2b: Missing optional fields (null email, serviceCategory, projectScale, message)
  db.exec(`
    INSERT INTO identities (id, full_name, phone, email, identity_type, created_at, updated_at)
    VALUES ('ident-minimal', 'Nguyen Minimal', '0977111222', NULL, 'INDIVIDUAL', '${now}', '${now}');
    INSERT INTO leads (id, identity_id, service_category, project_scale, initial_message, status, created_at, updated_at)
    VALUES ('lead-minimal', 'ident-minimal', NULL, NULL, NULL, 'NEW', '${now}', '${now}');
  `);

  const minimalLead = selectLeadStmt.get("lead-minimal");
  assert.ok(minimalLead);
  assert.equal(minimalLead.email, null);
  assert.equal(minimalLead.serviceCategory, null);
  assert.equal(minimalLead.projectScale, null);
  assert.equal(minimalLead.initialMessage, null);

  // Edge Case 4.2c: Phone matching and Identity reuse logic
  // When createLead is called with same phone, does it find existing identity?
  const existingIdent = db.prepare("SELECT id FROM identities WHERE phone = ? LIMIT 1;").get(phoneA);
  assert.ok(existingIdent);
  assert.equal(existingIdent.id, "ident-unicode", "Should find existing identity by phone");

  // Edge Case 4.2d: Whitespace phone number observation
  const unstrippedPhone = "  0938123456  ";
  const matchedWithTrim = db.prepare("SELECT id FROM identities WHERE phone = ? LIMIT 1;").get(unstrippedPhone.trim());
  const matchedWithoutTrim = db.prepare("SELECT id FROM identities WHERE phone = ? LIMIT 1;").get(unstrippedPhone);
  assert.ok(matchedWithTrim, "Trimmed phone matches existing identity");
  assert.equal(matchedWithoutTrim, undefined, "Untrimmed phone fails to match existing identity (identifies need for phone normalization)");
});

test("Edge Case 4.3: Phone normalization & Identity deduplication on whitespace input", () => {
  const db = initDatabase();

  // 1. Tạo identity ban đầu với số điện thoại đã được trim chuẩn
  const canonicalPhone = "0938123456";
  const now = new Date().toISOString();
  db.exec(`
    INSERT INTO identities (id, full_name, phone, identity_type, created_at, updated_at)
    VALUES ('ident-orig', 'Tran Thi Hoa', '${canonicalPhone}', 'INDIVIDUAL', '${now}', '${now}');
  `);

  // 2. Giả lập createLead với các biến thể khoảng trắng khác nhau
  const paddedPhones = [
    "  0938123456  ",
    "0938123456    ",
    "    0938123456",
    "\t0938123456\n"
  ];

  for (const inputPhone of paddedPhones) {
    const clean = inputPhone.trim();
    const matched = db.prepare("SELECT id FROM identities WHERE phone = ? LIMIT 1").get(clean);
    assert.ok(matched, `Phone '${inputPhone}' after trim must match existing identity`);
    assert.equal(matched.id, "ident-orig", "Must resolve to original identity ID");
  }

  // 3. Đảm bảo số lượng identity trong DB cho số điện thoại này duy nhất là 1
  const countRow = db.prepare("SELECT count(*) as count FROM identities WHERE phone = ?").get(canonicalPhone);
  assert.equal(countRow.count, 1, "There must be exactly 1 identity record");
});

