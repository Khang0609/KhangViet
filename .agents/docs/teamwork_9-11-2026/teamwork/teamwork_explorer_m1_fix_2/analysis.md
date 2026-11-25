# Technical Investigation & Migration Blueprint: SQLite & Drizzle CHECK Constraints & Migrations Architect

**Author:** Explorer 5 (SQLite & Drizzle CHECK Constraints & Migrations Architect)  
**Target Milestone:** Milestone 1 Iteration 2 (Gate Review Remediations)  
**Date:** 2026-11-08  
**Artifact Directory:** `.agents/teamwork/teamwork_explorer_m1_fix_2/`

---

## 1. Executive Summary & Root Cause Analysis

Following the Gate review failures from Reviewer 1 (`REQUEST_CHANGES`), Reviewer 2 (`REQUEST_CHANGES`), and Challenger 1 (`REQUEST_CHANGES`), this investigation has conducted an exhaustive, empirical examination into:
1. **Missing SQLite CHECK Constraints** at both the Drizzle ORM schema level and the SQL migration level for `user_accounts.role`, `leads.status`, and `projects.status`.
2. **Missing Migration Metadata** (`packages/repositories/migrations/meta/0001_snapshot.json`), which breaks `drizzle-kit generate` in non-interactive CI environments due to broken journal validation.

### Core Discoveries:
- **Root Cause of Missing CHECK Constraints**: Worker 1 relied solely on TypeScript compile-time typing (`.$type<UserRole>()`, `.$type<LeadStatus>()`, `.$type<ProjectStatus>()`) without registering runtime `check(...)` callbacks in `drizzle-orm/sqlite-core`. SQLite tables were created without database-level CHECK constraints, permitting invalid strings (such as `'GUEST'`, `'SUPER_HACKER'`, `'BOGUS_STATUS'`) to be stored directly in D1 SQLite.
- **Root Cause of Missing `0001_snapshot.json`**: The migration SQL `0001_enterprise_identities_and_media.sql` was authored without running `drizzle-kit generate` to persist the Drizzle schema AST snapshot. While `_journal.json` had an entry for idx 1, no corresponding `meta/0001_snapshot.json` existed. In `drizzle-kit` v0.31.11, `prepareMigrationFolder` invokes `snapshots.reduce()` which throws `ENOENT: no such file or directory, open '.../meta/0001_snapshot.json'`.
- **Empirical Validation**:
  - We isolated the updated schemas in a sandbox, executed `drizzle-kit generate`, and captured the exact, valid AST snapshot JSON.
  - When `0001_snapshot.json` is linked to `prevId: bbecc0d0-75cb-4bc4-a057-0b0b0e477bdd`, `drizzle-kit generate` validates the full journal chain, compares schema to snapshot, and outputs: **`"No schema changes, nothing to migrate 😴"`** (Exit code 0).
  - We executed the full dual-migration sequence (`0000_magenta_midnight.sql` -> legacy data load -> `0001_enterprise_identities_and_media.sql`) on SQLite engine with `PRAGMA foreign_keys = ON`. Legacy migration completed seamlessly, and subsequent invalid inserts on `role`, `leads.status`, and `projects.status` were all rejected with `CHECK constraint failed`.

---

## 2. Issue 1: SQLite & Drizzle CHECK Constraints

### 2.1 Table `user_accounts` — Role Constraint

- **Requirement**: `role (CHECK: ADMIN, STAFF, CUSTOMER)` (`ORIGINAL_REQUEST.md` §R1 line 14).
- **Target File**: `packages/repositories/src/d1/schema/user-accounts.schema.ts`
- **Current Defect**: Table was declared with no 3rd callback parameter:
  ```ts
  export const userAccountsTable = sqliteTable(
    "user_accounts",
    { ... }
  );
  ```
- **Remediation in Drizzle Schema**:
  Import `check` from `"drizzle-orm/sqlite-core"` and `sql` from `"drizzle-orm"`.
  ```ts
  import { sqliteTable, text, integer, check } from "drizzle-orm/sqlite-core";
  import { sql } from "drizzle-orm";
  import type { UserRole } from "@khangviet/types";
  import { identitiesTable } from "./identities.schema";

  export const userAccountsTable = sqliteTable(
    "user_accounts",
    {
      id: text("id").primaryKey(),
      identityId: text("identity_id")
        .notNull()
        .references(() => identitiesTable.id, { onDelete: "restrict" }),
      email: text("email").notNull().unique(),
      passwordHash: text("password_hash").notNull(),
      role: text("role").$type<UserRole>().notNull().default("CUSTOMER"),
      isActive: integer("is_active").notNull().default(1),
      createdAt: text("created_at").notNull(),
      updatedAt: text("updated_at").notNull(),
    },
    (table) => [
      check(
        "check_user_accounts_role",
        sql`${table.role} IN ('ADMIN', 'STAFF', 'CUSTOMER')`
      ),
    ]
  );
  ```
  *Line count check: 33 lines (well under the 100-line hard limit).*

- **Remediation in Migration SQL (`0001_enterprise_identities_and_media.sql`)**:
  ```sql
  CREATE TABLE IF NOT EXISTS `user_accounts` (
  	`id` text PRIMARY KEY NOT NULL,
  	`identity_id` text NOT NULL,
  	`email` text NOT NULL,
  	`password_hash` text NOT NULL,
  	`role` text DEFAULT 'CUSTOMER' NOT NULL,
  	`is_active` integer DEFAULT 1 NOT NULL,
  	`created_at` text NOT NULL,
  	`updated_at` text NOT NULL,
  	CONSTRAINT `check_user_accounts_role` CHECK(`role` IN ('ADMIN', 'STAFF', 'CUSTOMER')),
  	FOREIGN KEY (`identity_id`) REFERENCES `identities`(`id`) ON UPDATE no action ON DELETE restrict
  );
  ```

---

### 2.2 Table `leads` — Status Constraint

- **Requirement**: `status (CHECK: NEW, CONTACTED, SURVEY_SCHEDULED, QUOTED, WON, LOST)` (`ORIGINAL_REQUEST.md` §R1 line 15).
- **Target File**: `packages/repositories/src/d1/schema/leads.schema.ts`
- **Current Defect**: Table callback contained only 3 indexes, with no check constraint.
- **Remediation in Drizzle Schema**:
  Import `check` from `"drizzle-orm/sqlite-core"` and `sql` from `"drizzle-orm"`.
  ```ts
  import { sqliteTable, text, index, check } from "drizzle-orm/sqlite-core";
  import { sql } from "drizzle-orm";
  import type { LeadStatus } from "@khangviet/types";
  import { identitiesTable } from "./identities.schema";

  export const leadsTable = sqliteTable(
    "leads",
    {
      id: text("id").primaryKey(),
      identityId: text("identity_id")
        .notNull()
        .references(() => identitiesTable.id, { onDelete: "restrict" }),
      serviceCategory: text("service_category"),
      projectScale: text("project_scale"),
      initialMessage: text("initial_message"),
      status: text("status").$type<LeadStatus>().notNull().default("NEW"),
      createdAt: text("created_at").notNull(),
      updatedAt: text("updated_at").notNull(),
    },
    (table) => [
      index("idx_leads_identity_id").on(table.identityId),
      index("idx_leads_status").on(table.status),
      index("idx_leads_created_at").on(table.createdAt),
      check(
        "check_leads_status",
        sql`${table.status} IN ('NEW', 'CONTACTED', 'SURVEY_SCHEDULED', 'QUOTED', 'WON', 'LOST')`
      ),
    ]
  );
  ```
  *Line count check: 37 lines (well under the 100-line hard limit).*

- **Remediation in Migration SQL (`0001_enterprise_identities_and_media.sql`)**:
  ```sql
  CREATE TABLE IF NOT EXISTS `leads_new` (
  	`id` text PRIMARY KEY NOT NULL,
  	`identity_id` text NOT NULL,
  	`service_category` text,
  	`project_scale` text,
  	`initial_message` text,
  	`status` text DEFAULT 'NEW' NOT NULL,
  	`created_at` text NOT NULL,
  	`updated_at` text NOT NULL,
  	CONSTRAINT `check_leads_status` CHECK(`status` IN ('NEW', 'CONTACTED', 'SURVEY_SCHEDULED', 'QUOTED', 'WON', 'LOST')),
  	FOREIGN KEY (`identity_id`) REFERENCES `identities`(`id`) ON UPDATE no action ON DELETE restrict
  );
  ```

---

### 2.3 Table `projects` — Status Constraint & Year Boundary

- **Requirement**: `status (CHECK: DRAFT, PUBLISHED, ARCHIVED)` alongside `1990 <= year AND year <= 2100` (`ORIGINAL_REQUEST.md` §R1 line 18).
- **Target File**: `packages/repositories/src/d1/schema/projects.schema.ts`
- **Current Defect**: Table callback contained `projects_year_range` check constraint, but `check_projects_status` was omitted.
- **Remediation in Drizzle Schema**:
  ```ts
    (table) => [
      index("idx_projects_category").on(table.categoryTag),
      index("idx_projects_status").on(table.status),
      check("projects_year_range", sql`${table.year} >= 1990 AND ${table.year} <= 2100`),
      check("check_projects_status", sql`${table.status} IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')`),
    ]
  ```
  *Line count check: 45 lines (well under the 100-line hard limit).*

- **Remediation in Migration SQL (`0001_enterprise_identities_and_media.sql`)**:
  ```sql
  CREATE TABLE IF NOT EXISTS `projects_new` (
  	`id` text PRIMARY KEY NOT NULL,
  	`code` text NOT NULL,
  	`title` text NOT NULL,
  	`subtitle` text NOT NULL,
  	`client` text NOT NULL,
  	`client_identity_id` text,
  	`locations` text NOT NULL,
  	`year` integer NOT NULL,
  	`category_tag` text NOT NULL,
  	`scale_metric` text NOT NULL,
  	`materials` text NOT NULL,
  	`engineering_notes` text NOT NULL,
  	`summary` text NOT NULL,
  	`cover_image` text NOT NULL,
  	`status` text DEFAULT 'PUBLISHED' NOT NULL,
  	`sort_order` integer DEFAULT 0 NOT NULL,
  	`created_at` text NOT NULL,
  	`updated_at` text NOT NULL,
  	CONSTRAINT `projects_year_range` CHECK(`projects_new`.`year` >= 1990 AND `projects_new`.`year` <= 2100),
  	CONSTRAINT `check_projects_status` CHECK(`status` IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  	FOREIGN KEY (`client_identity_id`) REFERENCES `identities`(`id`) ON UPDATE no action ON DELETE set null
  );
  ```

---

## 3. Issue 2: Drizzle Migration Metadata & Snapshot Architecture

### 3.1 Understanding Drizzle Kit Snapshot Mechanics
`drizzle-kit` maintains an append-only journal in `migrations/meta/_journal.json`:
```json
{
  "version": "7",
  "dialect": "sqlite",
  "entries": [
    {
      "idx": 0,
      "version": "6",
      "when": 1794053562911,
      "tag": "0000_magenta_midnight",
      "breakpoints": true
    },
    {
      "idx": 1,
      "version": "6",
      "when": 1794053600000,
      "tag": "0001_enterprise_identities_and_media",
      "breakpoints": true
    }
  ]
}
```

When `drizzle-kit generate` executes:
1. It reads `_journal.json`.
2. For each entry `i` in `entries`, it attempts to load `meta/{pad4(i)}_snapshot.json`.
3. In Milestone 1 Iteration 1, `idx: 1` had no corresponding `meta/0001_snapshot.json`.
4. As a result, running `pnpm --filter @khangviet/repositories run db:generate` failed with:
   `ENOENT: no such file or directory, open '.../migrations/meta/0001_snapshot.json'`

### 3.2 Authentic `0001_snapshot.json` Blueprint
To ensure exact compatibility with `drizzle-kit@0.31.11` (dialect SQLite, version 6):
- `prevId` must equal `bbecc0d0-75cb-4bc4-a057-0b0b0e477bdd` (matching `0000_snapshot.json.id`).
- `id` is a unique UUID (e.g. `2b418626-ea1e-41f8-bb08-c08d619fabfd`).
- Tables must contain all 8 active tables: `identities`, `user_accounts`, `leads`, `lead_activities`, `projects`, `project_media`, `cms_metadata`, and `pending_changes`.
- Exact check constraints recorded in AST:
  - `user_accounts`: `"check_user_accounts_role": { "name": "check_user_accounts_role", "value": "\"user_accounts\".\"role\" IN ('ADMIN', 'STAFF', 'CUSTOMER')" }`
  - `leads`: `"check_leads_status": { "name": "check_leads_status", "value": "\"leads\".\"status\" IN ('NEW', 'CONTACTED', 'SURVEY_SCHEDULED', 'QUOTED', 'WON', 'LOST')" }`
  - `projects`:
    - `"projects_year_range": { "name": "projects_year_range", "value": "\"projects\".\"year\" >= 1990 AND \"projects\".\"year\" <= 2100" }`
    - `"check_projects_status": { "name": "check_projects_status", "value": "\"projects\".\"status\" IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')" }`

The complete, verified snapshot file has been generated and saved at:
`.agents/teamwork/teamwork_explorer_m1_fix_2/proposed_0001_snapshot.json` (21,282 bytes).

---

## 4. Test Suite Strategy & Hard Enforcement

### 4.1 Discovery on Test Runner
In `packages/repositories/package.json`:
`"test": "node --test test/*.test.mjs"`
Because `adversarial-party-identity.mjs` and `adversarial-projects-media.mjs` lack the `.test.mjs` suffix, running `pnpm test` skipped them!

### 4.2 Test Hardening Plan
1. **Rename test files to `.test.mjs`**:
   - `packages/repositories/test/adversarial-party-identity.test.mjs`
   - `packages/repositories/test/adversarial-projects-media.test.mjs`
2. **Upgrade assertions from warnings to hard assertions**:
   In `adversarial-party-identity.test.mjs` Task 3.3:
   ```js
   assert.equal(roleCheckEnforced, true, "Inserting invalid role 'GUEST' MUST fail SQLite CHECK constraint");
   assert.equal(rootCheckEnforced, true, "Inserting invalid role 'ROOT' MUST fail SQLite CHECK constraint");
   ```
   Add test for lead status check:
   ```js
   assert.throws(
     () => {
       db.exec("INSERT INTO leads (id, identity_id, status, created_at, updated_at) VALUES ('l-inv', 'u-001', 'BOGUS_STATUS', '2026', '2026');");
     },
     /CHECK constraint failed/i,
     "Inserting invalid lead status MUST fail SQLite CHECK constraint"
   );
   ```
3. **Add Project Status Check in `adversarial-projects-media.test.mjs`**:
   ```js
   assert.throws(
     () => {
       db.exec(`
         INSERT INTO projects (
           id, code, title, subtitle, client, locations, year, category_tag,
           scale_metric, materials, engineering_notes, summary, cover_image,
           status, sort_order, created_at, updated_at
         ) VALUES (
           'p-inv-status', 'kv-inv-status', 'Inv Status', 'Sub', 'Client',
           '["Hanoi"]', 2026, 'Commercial', '100m2', '["Glass"]', '["Notes"]',
           'Summary', 'cover.jpg', 'BOGUS_STATUS', 0, '2026-01-01', '2026-01-01'
         );
       `);
     },
     /CHECK constraint failed/i,
     "Inserting invalid project status MUST fail SQLite CHECK constraint"
   );
   ```

---

## 5. Concrete Action Plan for Implementation Worker

| Step | Action | Target File | Verification Check |
|---|---|---|---|
| **1** | Add `check_user_accounts_role` | `packages/repositories/src/d1/schema/user-accounts.schema.ts` | File length <= 35 lines |
| **2** | Add `check_leads_status` | `packages/repositories/src/d1/schema/leads.schema.ts` | File length <= 40 lines |
| **3** | Add `check_projects_status` | `packages/repositories/src/d1/schema/projects.schema.ts` | File length <= 50 lines |
| **4** | Update table DDL with `CONSTRAINT ... CHECK(...)` | `packages/repositories/migrations/0001_enterprise_identities_and_media.sql` | Drop-in from `proposed_0001_enterprise_identities_and_media.sql` |
| **5** | Copy verified snapshot | Copy `proposed_0001_snapshot.json` to `packages/repositories/migrations/meta/0001_snapshot.json` | `pnpm --filter @khangviet/repositories run db:generate` outputs "No schema changes, nothing to migrate" |
| **6** | Rename & harden tests | Rename `adversarial-*.mjs` to `adversarial-*.test.mjs` and enable strict `assert.throws` | `pnpm --filter @khangviet/repositories test` runs all tests and passes 100% |
| **7** | Verify monorepo builds & API tests | `apps/api`, `packages/repositories`, `apps/web` | `pnpm --filter @khangviet/repositories run build`<br>`pnpm --filter api run build`<br>`pnpm --filter api test:auth` (12/12 pass) |
