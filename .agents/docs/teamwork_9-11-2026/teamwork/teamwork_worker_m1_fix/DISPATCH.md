## 2026-11-08T05:00:53Z

You are Worker 2: Database & Schema Remediation Engineer for Milestone 1 Iteration 2.

Your task is to implement the fixes designed by Explorers 4, 5, and 6 to remediate the Forensic Audit Integrity Veto and Reviewer findings.

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Authoritative Inputs
- Read ORIGINAL_REQUEST.md at: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\ORIGINAL_REQUEST.md
- Read PROJECT.md at: e:\lap_trinh\Project\website\KhangVietDesign\source\PROJECT.md
- Read Explorer 4 Handoff & Blueprint: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_explorer_m1_fix_1\handoff.md
- Read Explorer 5 Handoff & Blueprint: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_explorer_m1_fix_2\handoff.md
- Read Explorer 6 Handoff & Blueprint: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_explorer_m1_fix_3\handoff.md
- Working Directory: e:\lap_trinh\Project\website\KhangVietDesign\source
- Your State Folder: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_worker_m1_fix

## Specific Tasks
1. **Modularization (Hard limits: <= 100 lines/file, <= 35 lines/function)**:
   - Refactor `packages/repositories/src/d1/repositories/d1-lead-repository.ts` and `lead-mapper.ts` following Explorer 4's blueprint. Ensure `d1-lead-repository.ts` is <= 80 lines and `createLead` is <= 25 lines. Ensure `data.phone.trim()` is applied.
   - Refactor `packages/repositories/src/d1/repositories/d1-cms-project-repo.ts` and `project-mapper.ts` following Explorer 4's blueprint. Ensure `d1-cms-project-repo.ts` is <= 85 lines.
   - Refactor `packages/repositories/src/d1/seed-projects.ts` following Explorer 4's blueprint: break into 3 functions <= 26 lines each.
   - Refactor `packages/repositories/src/d1/repositories/d1-user-repository.ts`: extract `user-mapper.ts` (35 lines), ensuring class file is <= 60 lines.
   - In all repository classes, convert constructor parameter properties (`constructor(private client: D1Client)`) to explicit class properties (`private client: D1Client; constructor(client: D1Client) { this.client = client; }`) for Node 22 native test compatibility.
2. **SQLite & Drizzle CHECK Constraints & Migration Snapshot**:
   - In `user-accounts.schema.ts`: add `check("check_user_accounts_role", sql\`role IN ('ADMIN', 'STAFF', 'CUSTOMER')\`)`.
   - In `leads.schema.ts`: add `check("check_leads_status", sql\`status IN ('NEW', 'CONTACTED', 'SURVEY_SCHEDULED', 'QUOTED', 'WON', 'LOST')\`)`.
   - In `projects.schema.ts`: add `check("check_projects_status", sql\`status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')\`)`.
   - In `migrations/0001_enterprise_identities_and_media.sql`: update with the drop-in replacement from `.agents/teamwork/teamwork_explorer_m1_fix_2/proposed_0001_enterprise_identities_and_media.sql`.
   - Copy `.agents/teamwork/teamwork_explorer_m1_fix_2/proposed_0001_snapshot.json` to `packages/repositories/migrations/meta/0001_snapshot.json`.
3. **Test Suite Harmonization**:
   - Rename `packages/repositories/test/adversarial-party-identity.mjs` to `adversarial-party-identity.test.mjs`.
   - Rename `packages/repositories/test/adversarial-projects-media.mjs` to `adversarial-projects-media.test.mjs`.
   - Ensure `package.json` runs all test suites with `node --test test/*.test.mjs`.
4. **Build & Test Verification**:
   - Run `pnpm --filter @khangviet/repositories run build`
   - Run `pnpm --filter @khangviet/repositories test` (All 40+ tests across 4 test suites must PASS)
   - Run `pnpm --filter api run build`
   - Run `pnpm --filter api test:auth` (All 12 e2e scenarios must PASS)
   - Measure actual line counts of all files in `packages/repositories/src/d1/` and document exact metrics in `handoff.md`.

## Deliverables
- Write `changes.md` and `handoff.md` in your state folder.
- Notify orchestrator via `send_message`.
