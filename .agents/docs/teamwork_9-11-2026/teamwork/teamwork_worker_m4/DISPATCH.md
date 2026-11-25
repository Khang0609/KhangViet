## 2026-11-08T07:44:00Z

[Message] timestamp=2026-11-08T07:43:55Z sender=9875b955-8c1f-4348-971a-46ec427f4059 priority=MESSAGE_PRIORITY_HIGH content=DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

# Assignment: Milestone 4 — Monorepo E2E Verification & Integration Execution

## Context & Objectives
You are Worker 7 (Monorepo E2E Verification Engineer).
Milestones 1 (Database & Migrations), 2 (Media Worker), and 3 (Admin UI Universal Media Dropzone) have all been completed and passed their independent gates.
Your objective is to execute the comprehensive end-to-end verification of the entire monorepo to confirm that all builds succeed, all migration scripts apply cleanly, all automated test suites pass with 100% success rate, and all acceptance criteria from the user are satisfied.

## Authoritative Reference Documents (Read FIRST):
1. `ORIGINAL_REQUEST.md`: `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\ORIGINAL_REQUEST.md`
2. `PROJECT.md`: `e:\lap_trinh\Project\website\KhangVietDesign\source\PROJECT.md`
3. `TEST_INFRA.md`: `e:\lap_trinh\Project\website\KhangVietDesign\source\TEST_INFRA.md`

## Your State Folder:
`e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_worker_m4`

## Mandatory Execution Tasks:

### 1. Build Verification Across All Packages:
Execute and capture output and exit codes for:
- `pnpm --filter @khangviet/repositories build` (or `tsc --noEmit -p packages/repositories/tsconfig.json`)
- `pnpm --filter api build` (or `npx wrangler deploy --dry-run --outdir=apps/api/dist`)
- `node ./node_modules/.pnpm/typescript@5.9.3/node_modules/typescript/bin/tsc --noEmit -p apps/web/tsconfig.json`
- `cd apps/web; npx next build --webpack` (must prerender all 7 static routes)

### 2. Monorepo Automated Test Suite Execution:
Execute and capture output and exit codes for:
- `cd packages/repositories; node --test test/*.test.mjs` (All 39 unit & migration tests)
- `node apps/api/test-e2e.mjs` (All 12 Auth, Cookie, and RBAC scenarios)
- `node apps/media-worker/test-e2e.mjs` (All 7 Media Worker endpoints & R2 integration tests)
- `node apps/media-worker/test-stress-security.mjs` (All 35 SSRF and security tests)
- `node apps/media-worker/test-stress-ingestion.mjs` (All 29 ingestion and format conversion tests)
- `node apps/web/test-media-upload.mjs` (Milestone 3 unit & AST verification)
- `node apps/web/test-stress-dropzone.mjs` (Milestone 3 adversarial stress harness: 22/22 tests)
- `node apps/web/test-challenger-deep-stress.mjs` (Milestone 3 deep stress tests: 11/11 tests)

### 3. Acceptance Criteria Cross-Check:
Cross-check every single requirement in `ORIGINAL_REQUEST.md § Acceptance Criteria`:
- Party/Identity schema & 3NF normalization
- Dedicated Media Worker on port 8788 with R2 WebP conversion
- Admin UI UniversalMediaUpload supporting 4 modes (Browse, Drag & Drop, Paste clipboard, External URL fetch)

## Deliverables:
- Write `handoff.md` in your state folder with complete verification log, summary table of all test suites (total tests run, passed, failed), build outputs, and exit codes.
- Send a completion message via `send_message` to orchestrator (`9875b955-8c1f-4348-971a-46ec427f4059`).
