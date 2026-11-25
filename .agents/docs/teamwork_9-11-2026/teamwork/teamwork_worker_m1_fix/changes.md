# Detailed Changes Log — Milestone 1 Iteration 2 Remediation

## Overview
Worker 2 implemented the database, schema, repository modularization, and test suite harmonization designed by Explorers 4, 5, and 6 to remediate the Forensic Audit integrity veto and reviewer findings.

---

## 1. Modularization & Architectural Limits De-escalation (Hard Limits: <= 100 lines/file, <= 35 lines/function)

### 1.1. `packages/repositories/src/d1/repositories/d1-lead-repository.ts` (80 lines)
- Reduced from 112 lines to 80 lines (strictly <= 80 target, <= 100 hard limit).
- Converted constructor parameter property `constructor(private readonly client: D1Client)` to explicit class property `private readonly client: D1Client; constructor(client: D1Client) { this.client = client; }` for Node 22 native compatibility.
- Streamlined `createLead` to 12 lines (strictly <= 25 target, <= 35 limit) by delegating identity lookup to `findOrCreateIdentity`.
- Enforced phone trimming (`data.phone.trim()`) to prevent identity duplication across whitespace variants.
- Streamlined `getLeads` to 13 lines, `updateLeadStatus` to 10 lines.

### 1.2. `packages/repositories/src/d1/repositories/lead-mapper.ts` (33 lines)
- Retained clean data transformation interface `LeadJoinedRow` and pure mapping function `mapToContactLead`.
- Zero runtime relative imports to guarantee instant, clean imports in Node 22 ESM test runners.

### 1.3. `packages/repositories/src/d1/repositories/d1-cms-project-repo.ts` (81 lines)
- Reduced from 102 lines to 81 lines (strictly <= 85 target, <= 100 hard limit).
- Converted constructor parameter property to explicit property `private readonly client: D1Client; constructor(client: D1Client) { this.client = client; }`.
- Scoped gallery media synchronization `syncProjectMedia` (12 lines) to filter deletions strictly by `and(eq(projectId), eq(mediaType, "GALLERY_IMAGE"))`, preventing accidental deletion of non-gallery project media.
- Reused `parseProjectYear(data.year)` from `./project-mapper`.
- Every method is <= 17 lines (strictly <= 35 limit).

### 1.4. `packages/repositories/src/d1/repositories/project-mapper.ts` (41 lines)
- Contains `parseProjectYear`, `mapMediaToGalleryItem`, and `mapProjectRecordToFeatured`.
- All relative imports are type-only (`import type`), ensuring seamless import by test suites with Node 22 ESM type-stripping.

### 1.5. `packages/repositories/src/d1/seed-projects.ts` (67 lines)
- Decomposed monolithic `seedProjectsAndMedia` (previously 42 lines) into 3 discrete sub-functions:
  1. `seedProjectMediaList` (22 lines): inserts media records with `onConflictDoNothing()`.
  2. `seedSingleProject` (30 lines): inserts project record and invokes `seedProjectMediaList`.
  3. `seedProjectsAndMedia` (5 lines): iterates over `initialLandingContent.featuredProjects`.
- Every function is <= 30 lines (strictly <= 35 hard limit).

### 1.6. `packages/repositories/src/d1/repositories/user-mapper.ts` (36 lines) [NEW FILE]
- Extracted `UserJoinedRow`, `mapToUser` (12 lines), and `mapToSafeUser` (10 lines) into a standalone mapper file.
- Established clean architectural symmetry across all three repository domains (Leads, Projects, Users).

### 1.7. `packages/repositories/src/d1/repositories/d1-user-repository.ts` (65 lines)
- Reduced from 94 lines to 65 lines (strictly <= 80 target, <= 100 limit).
- Converted constructor parameter property to explicit class property.
- Replaced inline mapping logic with calls to `mapToUser` and `mapToSafeUser`.

### 1.8. `packages/repositories/src/d1/repositories/d1-cms-meta-repo.ts` (78 lines)
- Reduced from 120 lines to 78 lines (strictly <= 100 hard limit).
- Converted constructor parameter property to explicit class property.
- Every function is <= 12 lines.

### 1.9. `packages/repositories/src/d1/repositories/d1-cms-repository.ts` (82 lines)
- Reduced from 123 lines to 82 lines (strictly <= 100 hard limit).
- Preserved all delegating methods to `projectRepo` and `metaRepo`.

### 1.10. `packages/repositories/src/d1/repositories/index.ts` (9 lines)
- Added `export * from "./user-mapper";` to public repository barrel.

---

## 2. Schema CHECK Constraints & Migration Snapshot

### 2.1. `packages/repositories/src/d1/schema/user-accounts.schema.ts` (31 lines)
- Added Drizzle CHECK constraint:
  `check("check_user_accounts_role", sql\`${table.role} IN ('ADMIN', 'STAFF', 'CUSTOMER')\`)`.

### 2.2. `packages/repositories/src/d1/schema/leads.schema.ts` (34 lines)
- Added Drizzle CHECK constraint:
  `check("check_leads_status", sql\`${table.status} IN ('NEW', 'CONTACTED', 'SURVEY_SCHEDULED', 'QUOTED', 'WON', 'LOST')\`)`.

### 2.3. `packages/repositories/src/d1/schema/projects.schema.ts` (45 lines)
- Added Drizzle CHECK constraint:
  `check("check_projects_status", sql\`${table.status} IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')\`)`.

### 2.4. `packages/repositories/migrations/0001_enterprise_identities_and_media.sql`
- Added explicit SQLite table constraints:
  - `user_accounts`: `CONSTRAINT check_user_accounts_role CHECK(role IN ('ADMIN', 'STAFF', 'CUSTOMER'))`
  - `leads`: `CONSTRAINT check_leads_status CHECK(status IN ('NEW', 'CONTACTED', 'SURVEY_SCHEDULED', 'QUOTED', 'WON', 'LOST'))`
  - `projects`: `CONSTRAINT check_projects_status CHECK(status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'))`

### 2.5. `packages/repositories/migrations/meta/0001_snapshot.json`
- Synchronized Drizzle Kit AST snapshot with `0001_enterprise_identities_and_media`.
- Verified via `pnpm --filter @khangviet/repositories run db:generate`: returns `"No schema changes, nothing to migrate 😴"`.

---

## 3. Test Suite Harmonization

### 3.1. File Renaming
- `packages/repositories/test/adversarial-party-identity.mjs` ➔ `adversarial-party-identity.test.mjs`
- `packages/repositories/test/adversarial-projects-media.mjs` ➔ `adversarial-projects-media.test.mjs`

### 3.2. `packages/repositories/package.json`
- `"test": "node --test test/*.test.mjs"`: runs all 4 test suites automatically.
- Added helper scripts `"test:adversarial"` and `"test:unit"`.

### 3.3. Test Upgrades in `adversarial-party-identity.test.mjs`
- Task 3.3: Converted previous `console.warn` into strict `assert.throws` checking SQLite CHECK constraint failure on invalid `role` ('GUEST', 'ROOT'), invalid `lead status` ('INVALID_STATUS'), and invalid `project status` ('INVALID_STATUS').
- Added Edge Case 4.3: Verified phone number whitespace trimming (`"  0938123456  "`, `"\t0938123456\n"`) correctly resolves to existing canonical identity without creating duplicate records.

---

## 4. Line Count Audit Table (All Files in `packages/repositories/src/d1/`)

| File Path | Physical Lines | Target Line Limit | Longest Method | Max Function Limit | Compliance Status |
| :--- | :---: | :---: | :--- | :---: | :---: |
| `d1/client.ts` | 14 | <= 100 | `createD1Client` (10 lines) | <= 35 | 🟢 PASS |
| `d1/index.ts` | 6 | <= 100 | N/A (barrel) | <= 35 | 🟢 PASS |
| `d1/repositories/d1-cms-meta-repo.ts` | 78 | <= 100 | `enqueueChange` (12 lines) | <= 35 | 🟢 PASS |
| `d1/repositories/d1-cms-project-repo.ts` | 81 | <= 100 | `updateProject` (16 lines) | <= 35 | 🟢 PASS |
| `d1/repositories/d1-cms-repository.ts` | 82 | <= 100 | `getLandingData` (13 lines) | <= 35 | 🟢 PASS |
| `d1/repositories/d1-lead-repository.ts` | 80 | <= 100 | `findOrCreateIdentity` (12 lines) | <= 35 | 🟢 PASS |
| `d1/repositories/d1-user-repository.ts` | 65 | <= 100 | `selectUserQuery` (15 lines) | <= 35 | 🟢 PASS |
| `d1/repositories/D1CmsProjectRepo.ts` | 2 | <= 100 | N/A (re-export) | <= 35 | 🟢 PASS |
| `d1/repositories/D1LeadRepository.ts` | 2 | <= 100 | N/A (re-export) | <= 35 | 🟢 PASS |
| `d1/repositories/D1UserRepository.ts` | 2 | <= 100 | N/A (re-export) | <= 35 | 🟢 PASS |
| `d1/repositories/index.ts` | 9 | <= 100 | N/A (barrel) | <= 35 | 🟢 PASS |
| `d1/repositories/lead-mapper.ts` | 33 | <= 100 | `mapToContactLead` (14 lines) | <= 35 | 🟢 PASS |
| `d1/repositories/project-mapper.ts` | 41 | <= 100 | `mapProjectRecordToFeatured` (17 lines) | <= 35 | 🟢 PASS |
| `d1/repositories/user-mapper.ts` | 36 | <= 100 | `mapToUser` (12 lines) | <= 35 | 🟢 PASS |
| `d1/schema/cms.schema.ts` | 37 | <= 100 | N/A (schema) | <= 35 | 🟢 PASS |
| `d1/schema/identities.schema.ts` | 33 | <= 100 | N/A (schema) | <= 35 | 🟢 PASS |
| `d1/schema/index.ts` | 8 | <= 100 | N/A (barrel) | <= 35 | 🟢 PASS |
| `d1/schema/lead-activities.schema.ts` | 29 | <= 100 | N/A (schema) | <= 35 | 🟢 PASS |
| `d1/schema/leads.schema.ts` | 34 | <= 100 | N/A (schema) | <= 35 | 🟢 PASS |
| `d1/schema/project-media.schema.ts` | 40 | <= 100 | N/A (schema) | <= 35 | 🟢 PASS |
| `d1/schema/projects.schema.ts` | 45 | <= 100 | N/A (schema) | <= 35 | 🟢 PASS |
| `d1/schema/user-accounts.schema.ts` | 31 | <= 100 | N/A (schema) | <= 35 | 🟢 PASS |
| `d1/seed-projects.ts` | 67 | <= 100 | `seedSingleProject` (30 lines) | <= 35 | 🟢 PASS |
| `d1/seed.ts` | 80 | <= 100 | `seedAll` (20 lines) | <= 35 | 🟢 PASS |
| `d1/uuid-v7.ts` | 29 | <= 100 | `generateUuidV7` (23 lines) | <= 35 | 🟢 PASS |
| **SUMMARY** | **25 files** | **Max: 85 lines** | **Max: 30 lines** | **Max: 35 lines** | **100% COMPLIANT** |
