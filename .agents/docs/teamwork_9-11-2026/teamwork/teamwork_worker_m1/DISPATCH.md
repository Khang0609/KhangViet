## 2026-11-08T04:12:21Z

You are Worker 1: Database & Migrations Engineer.

Your task is to implement Milestone 1: Database Schema & Migrations Layer (`packages/repositories`, `packages/types`, `apps/api`).

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Authoritative Inputs
- Read ORIGINAL_REQUEST.md at: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\ORIGINAL_REQUEST.md
- Read PROJECT.md at: e:\lap_trinh\Project\website\KhangVietDesign\source\PROJECT.md
- Read Explorer 1 Analysis: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_explorer_survey_1\analysis.md
- Read Explorer 1 Handoff: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_explorer_survey_1\handoff.md
- Working Directory: e:\lap_trinh\Project\website\KhangVietDesign\source
- Your State Folder: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_worker_m1

## Exclusive File Ownership
You own and may modify or create the following files:
- `packages/repositories/src/d1/schema/*` (`identities.schema.ts`, `user-accounts.schema.ts`, `leads.schema.ts`, `lead-activities.schema.ts`, `projects.schema.ts`, `project-media.schema.ts`, `index.ts`)
- `packages/repositories/src/d1/repositories/*` (`D1UserRepository.ts`, `D1LeadRepository.ts`, `D1CmsProjectRepo.ts`, `index.ts`)
- `packages/repositories/migrations/0001_enterprise_identities_and_media.sql`
- `packages/repositories/migrations/meta/_journal.json`
- `packages/repositories/src/d1/seed.ts`
- `packages/repositories/package.json` (add `"build": "tsc --noEmit"`)
- `packages/repositories/test/party-media-schema.test.mjs`
- `packages/types/src/user.ts`, `packages/types/src/project.ts`, `packages/types/src/crm.ts`, `packages/types/src/index.ts`
- `apps/api/package.json` (add `"build": "wrangler deploy --dry-run --outdir=dist"`)

## Specific Requirements
1. **Party / Identity Data Model (`packages/repositories/src/d1/schema/`)**:
   - `identities.schema.ts`: `id (UUIDv7)`, `full_name`, `phone (indexed)`, `email` (nullable), `tax_code` (nullable), `identity_type` ('INDIVIDUAL' | 'ORGANIZATION'), `address`, `notes`, `created_at`, `updated_at`.
   - `user-accounts.schema.ts`: `id (UUIDv7)`, `identity_id` (FK -> identities RESTRICT), `email` (UK), `password_hash`, `role` (CHECK: 'ADMIN' | 'STAFF' | 'CUSTOMER'), `is_active` (integer 1/0), `created_at`, `updated_at`.
   - `leads.schema.ts`: `id (UUIDv7)`, `identity_id` (FK -> identities RESTRICT), `service_category`, `project_scale`, `initial_message`, `status` (CHECK), `created_at`, `updated_at`.
   - `lead-activities.schema.ts`: `id (UUIDv7)`, `lead_id` (FK -> leads CASCADE), `staff_identity_id` (FK -> identities SET NULL), `action_type`, `content`, `created_at`.
2. **Projects & Media 3NF Normalization**:
   - `projects.schema.ts`: Remove `gallery` JSON, change `year` to `integer` (CHECK: 1990 <= year <= 2100), add `status` ('DRAFT' | 'PUBLISHED' | 'ARCHIVED'), `sort_order`, `client_identity_id` (FK -> identities SET NULL), `created_at`, `updated_at`. Remove duplicate index on `code` (use single unique index `projects_code_unique`).
   - `project-media.schema.ts`: `id (UUIDv7)`, `project_id` (FK -> projects CASCADE), `media_type` ('COVER' | 'GALLERY_IMAGE' | 'FLOOR_PLAN' | 'VIDEO'), `r2_key`, `public_url`, `caption`, `location`, `spec`, `aspect_ratio`, `width_px`, `height_px`, `file_size_bytes`, `sort_order`, `created_at`.
3. **Repository Adapters (100% Backward Compatibility)**:
   - `D1UserRepository`: JOIN `user_accounts` with `identities` on `identity_id` so it returns `User` and `SafeUser` with `{ id, email, role, password, info: { name, phone } }`.
   - `D1LeadRepository`: `createLead` upserts/finds `identities` by phone, inserts `leads`, and queries return standard `ContactLead` with `fullName`, `phone`, `email`.
   - `D1CmsProjectRepo`: Queries `project_media` rows and maps them to `ProjectGalleryItem[]` attached to `FeaturedProject.gallery`. When creating/updating projects, batch synchronizes `project_media`.
4. **Migration & Seed**:
   - Generate/write `migrations/0001_enterprise_identities_and_media.sql` following Explorer 1's safe data migration strategy.
   - Update `migrations/meta/_journal.json`.
   - Update `packages/repositories/src/d1/seed.ts` to populate identities, user_accounts, leads, projects, project_media.
5. **Types (`packages/types`)**:
   - Update `user.ts` (`UserRoleSchema` includes `"STAFF"`).
   - Export new Identity, UserAccount, ProjectMedia schemas/types.
   - Ensure `FeaturedProjectSchema.year` accepts numbers or number-strings.
6. **Package Scripts & Tests**:
   - Add `"build": "tsc --noEmit"` in `packages/repositories/package.json`.
   - Add `"build": "wrangler deploy --dry-run --outdir=dist"` in `apps/api/package.json`.
   - Create `packages/repositories/test/party-media-schema.test.mjs` verifying Party model foreign keys, cascade deletes, and constraints.
   - Run verification commands:
     * `pnpm --filter @khangviet/repositories run build`
     * `pnpm --filter @khangviet/repositories test`
     * `pnpm --filter api run build`
     * `pnpm --filter api test:auth`

## Code Standards
- Strict limit: <= 100 lines per file (split helpers/types into subfiles if needed).
- Strict limit: <= 35 lines per function.
- Do NOT break existing tests or public API contracts.

## Deliverables
- Write summary of changes to `changes.md` in your state folder.
- Write handoff report to `handoff.md` in your state folder including actual command outputs.
- Send completion message to orchestrator via `send_message`.


## 2026-11-08T04:26:46Z
**Context**: Milestone 1 Implementation (Database Schema & Migrations Layer)
**Content**: 13 minutes have elapsed since dispatch. Please provide a status update on your implementation progress across packages/types, packages/repositories/src/d1/schema, repositories, migrations, and test runs.
**Action**: Update progress.md and report current status.
