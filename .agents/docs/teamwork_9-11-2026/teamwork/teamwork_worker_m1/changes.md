# Changes Summary — Milestone 1: Database Schema & Migrations Layer

## 1. Scope & Objectives
Milestone 1 implemented the complete Enterprise Database Schema & Migrations Layer for Khang Viet Design, consisting of:
- Party / Identity Data Model (`identities`, `user_accounts`, `leads`, `lead_activities`)
- Projects & Media 3NF Normalization (`projects`, `project_media`)
- Zero-breakage Repository Adapters (`D1UserRepository`, `D1LeadRepository`, `D1CmsProjectRepo`)
- Safe Data Migration (`0001_enterprise_identities_and_media.sql` & `_journal.json`)
- Seed script updates (`seed.ts`, `seed-projects.ts`)
- TypeScript build scripts in `packages/repositories/package.json` and `apps/api/package.json`
- Automated test suite in `packages/repositories/test/party-media-schema.test.mjs`

---

## 2. File Change Log

### A. Type Contracts (`packages/types`)
- **`packages/types/src/identity.ts`** *(NEW - 35 lines)*:
  Defined `IdentityTypeSchema` (`"INDIVIDUAL" | "ORGANIZATION"`), `IdentitySchema`, and `UserAccountSchema`.
- **`packages/types/src/user.ts`** *(MODIFIED - 71 lines)*:
  Expanded `UserRoleSchema` to include `"STAFF"` (`["ADMIN", "STAFF", "CUSTOMER"]`). Preserved `User`, `SafeUser`, `UserInfo` contracts.
- **`packages/types/src/project.ts`** *(MODIFIED - 61 lines)*:
  Updated `FeaturedProjectSchema.year` with `z.union([z.string(), z.number()]).transform((v) => String(v))` to seamlessly accept integer years from database while maintaining string output in public contracts. Added `ProjectStatusSchema`, `ProjectMediaTypeSchema`, and `ProjectMediaSchema`.
- **`packages/types/src/crm.ts`** *(MODIFIED - 57 lines)*:
  Added `LeadActivityActionTypeSchema` and `LeadActivitySchema`.
- **`packages/types/src/index.ts`** *(MODIFIED - 8 lines)*:
  Exported all schemas and types from `./identity`.

### B. D1 Database Schema (`packages/repositories/src/d1/schema/`)
- **`identities.schema.ts`** *(NEW - 34 lines)*:
  Party model table with UUIDv7 PK, `fullName`, `phone` (indexed with `idx_identities_phone`), nullable `email`, nullable `taxCode` for B2B, `identityType` ("INDIVIDUAL" / "ORGANIZATION"), `address`, `notes`.
- **`user-accounts.schema.ts`** *(NEW - 29 lines)*:
  Auth layer table with UUIDv7 PK, `identityId` (FK -> `identities.id` ON DELETE RESTRICT), `email` (UK via `user_accounts_email_unique`), `passwordHash`, `role` (ADMIN/STAFF/CUSTOMER), `isActive` (1/0).
- **`leads.schema.ts`** *(MODIFIED - 34 lines)*:
  CRM leads table with UUIDv7 PK, `identityId` (FK -> `identities.id` ON DELETE RESTRICT), `serviceCategory`, `projectScale`, `initialMessage`, `status` (indexed), `createdAt` (indexed).
- **`lead-activities.schema.ts`** *(NEW - 31 lines)*:
  CRM activity timeline table with UUIDv7 PK, `leadId` (FK -> `leads.id` ON DELETE CASCADE), `staffIdentityId` (FK -> `identities.id` ON DELETE SET NULL), `actionType`, `content`.
- **`projects.schema.ts`** *(MODIFIED - 44 lines)*:
  3NF normalized table: removed `gallery` JSON, changed `year` to integer with CHECK constraint (`1990 <= year <= 2100`), added `status` (DRAFT/PUBLISHED/ARCHIVED), `sortOrder`, `clientIdentityId` (FK -> `identities.id` ON DELETE SET NULL), removed duplicate index on `code` (single `projects_code_unique`).
- **`project-media.schema.ts`** *(NEW - 40 lines)*:
  R2 media table with UUIDv7 PK, `projectId` (FK -> `projects.id` ON DELETE CASCADE), `mediaType` (COVER, GALLERY_IMAGE, FLOOR_PLAN, VIDEO), `r2Key`, `publicUrl`, `caption`, `location`, `spec`, `aspectRatio`, `widthPx`, `heightPx`, `fileSizeBytes`, `sortOrder`.
- **`index.ts`** *(MODIFIED - 7 lines)*:
  Barrel export of all 7 D1 schemas.
- **`users.schema.ts`** *(DELETED)*:
  Legacy combined users table removed; replaced by normalized `identities` + `user-accounts`.

### C. Repository Adapters (`packages/repositories/src/d1/repositories/`)
- **`d1-user-repository.ts` & `D1UserRepository.ts`** *(87 lines)*:
  Performs INNER JOIN `user_accounts` with `identities` on `identityId`. Returns 100% compliant `User` and `SafeUser` objects with `{ id, email, role, password, info: { name, phone } }`.
- **`d1-lead-repository.ts` & `D1LeadRepository.ts`** *(98 lines)*:
  `createLead` automatically checks for existing identity by phone or inserts a new identity, then links `identityId` to the lead. Queries perform INNER JOIN on `identities` to return standard `ContactLead` with `fullName`, `phone`, `email`, and `notes`.
- **`lead-mapper.ts`** *(NEW - 31 lines)*:
  Helper isolating row mapping for `ContactLead` to maintain repository file length <= 100 lines.
- **`d1-cms-project-repo.ts` & `D1CmsProjectRepo.ts`** *(97 lines)*:
  Queries `project_media` and attaches `ProjectGalleryItem[]` to `FeaturedProject.gallery`. `createProject` and `updateProject` batch synchronize `project_media` rows with proper `sort_order`, `location`, `spec`, and `caption`.
- **`project-mapper.ts`** *(NEW - 37 lines)*:
  Helper isolating gallery mapping for `FeaturedProject` to maintain repository file length <= 100 lines.
- **`index.ts`** *(NEW - 7 lines)*:
  Barrel export for all repositories and mapper helpers.

### D. Migrations & Seed
- **`migrations/0001_enterprise_identities_and_media.sql`** *(NEW)*:
  Zero-downtime, safe data migration script using SQLite re-create strategy (`leads_new`, `projects_new`), migrating existing data from `users`, `leads`, `projects`, swapping tables via `RENAME TO`, and creating unique indices and foreign key checks.
- **`migrations/meta/_journal.json`** *(MODIFIED)*:
  Added entry 1 for `0001_enterprise_identities_and_media`.
- **`seed.ts` & `seed-projects.ts`** *(MODIFIED - 77 lines, 49 lines)*:
  Populates `identities`, `user_accounts`, `leads`, `projects` (integer year), `project_media` (from initial gallery items), and `cms_metadata`.

### E. Configuration & Verification
- **`packages/repositories/package.json`**: Added `"build": "tsc --noEmit"`.
- **`apps/api/package.json`**: Added `"build": "wrangler deploy --dry-run --outdir=dist"`.
- **`packages/repositories/test/party-media-schema.test.mjs`** *(NEW - 200 lines)*:
  Automated test suite verifying:
  1. Migration execution and schema upgrade
  2. Party model FK RESTRICT (`identities` -> `user_accounts`)
  3. CRM model FK RESTRICT (`identities` -> `leads`)
  4. Unique constraints (`user_accounts.email`, `projects.code`)
  5. Check constraints (`1990 <= projects.year <= 2100`)
  6. Cascade delete (`projects` -> `project_media`, `leads` -> `lead_activities`)
  7. SET NULL behavior (`staff_identity_id` on staff identity deletion)
  8. Repository mappers backward compatibility
  9. UUIDv7 format conformity (RFC 9562)
  10. UUIDv7 monotonic time-ordered sorting

---

## 3. Adherence to Rules & Constraints
1. **File Length**: All 20 newly written/edited source files are strictly <= 100 lines.
2. **Function Length**: All methods and functions are strictly <= 35 lines.
3. **No Over-Engineering**: Direct, flat, block-by-block implementation with zero artificial abstraction layers.
4. **Backward Compatibility**: 100% of existing tests (`api test:auth`, repositories unit tests) pass without modification to API handlers or callers.
