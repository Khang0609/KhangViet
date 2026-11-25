# BRIEFING — 2026-11-08T06:11:00Z

## Mission
Scaffold and implement the dedicated Cloudflare Media Worker micro-service (`apps/media-worker`) with WASM WebP compression via `@cf-wasm/photon`, R2 storage, SSRF protection, health/upload/fetch/file endpoints, and an automated integration test suite, complying with <=100 lines/file and <=35 lines/function constraints.

## 🔒 My Identity
- Archetype: implementer
- Roles: implementer, qa
- Working directory: e:\lap_trinh\Project\website\KhangVietDesign\source
- State folder: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_worker_m2
- Original parent: 9875b955-8c1f-4348-971a-46ec427f4059
- Milestone: M2: Dedicated Cloudflare Media Worker

## 🔒 Key Constraints
- Exclusive file ownership: `apps/media-worker/*`
- Every file <= 100 lines
- Every function <= 35 lines
- NO CHEATING: Genuine implementations, real WebP conversion via `@cf-wasm/photon`, no dummy facade, real tests.
- Hono v4, Cloudflare Workers runtime, R2 binding `MEDIA_BUCKET` (`khangviet-media`).
- Endpoints: `POST /upload` (multipart & raw binary), `POST /fetch-external` (SSRF safe), `GET /file/*`, `GET /health`.
- Test suite: `test-e2e.mjs`.

## Current Parent
- Conversation ID: 9875b955-8c1f-4348-971a-46ec427f4059
- Updated: 2026-11-08T06:11:00Z

## Task Summary
- **What to build**: Dedicated Cloudflare Media Worker (`apps/media-worker`)
- **Success criteria**:
  1. `apps/media-worker` files created, strictly <=100 lines/file, functions <=35 lines.
  2. `wrangler deploy --dry-run` or build succeeds without errors.
  3. All 7 test cases in `test-e2e.mjs` pass cleanly.
  4. Real WebP compression using `@cf-wasm/photon` and memory management with `.free()`.
  5. Deliverables (`changes.md`, `handoff.md`) documented with exact commands and line counts.
- **Interface contracts**: PROJECT.md § Interface Contracts
- **Code layout**: PROJECT.md § Code Layout

## Key Decisions Made
- Used Hono v4 for ultra-lightweight edge worker micro-service.
- Integrated `@cf-wasm/photon` WebAssembly image processing targeting `@cf-wasm/photon/workerd`.
- Implemented robust SSRF protection blocking private RFC1918, loopback, and Cloud metadata IPs (`169.254.169.254`).
- Implemented dual upload ingestion: `multipart/form-data` and raw binary blob (for clipboard paste).
- Enforced strict 10MB payload size limits (HTTP 413) and downscaling bounding box (2560px max).

## Artifact Index
- `apps/media-worker/package.json` — Package definition with Hono and Wrangler scripts
- `apps/media-worker/wrangler.jsonc` — Cloudflare Workers config with R2 binding `MEDIA_BUCKET`
- `apps/media-worker/tsconfig.json` — TypeScript config for Workers
- `apps/media-worker/src/index.ts` — Hono app entry point with CORS and error handling
- `apps/media-worker/src/config/limits.ts` — Max file size (10MB) and dimension constraints (2560px)
- `apps/media-worker/src/config/cors.ts` — CORS middleware with origin whitelist
- `apps/media-worker/src/services/types.ts` — Types for bindings, responses, and R2 metadata
- `apps/media-worker/src/services/ssrf-validator.ts` — SSRF defensive validator
- `apps/media-worker/src/services/image-processor.ts` — WASM WebP converter & Lanczos3 resizer
- `apps/media-worker/src/services/r2-storage.ts` — Cloudflare R2 storage put/get operations
- `apps/media-worker/src/routes/health.ts` — Health check endpoint (`GET /health`)
- `apps/media-worker/src/routes/upload.ts` — Upload endpoint (`POST /upload`)
- `apps/media-worker/src/routes/fetch-external.ts` — External URL fetch endpoint (`POST /fetch-external`)
- `apps/media-worker/src/routes/file.ts` — Stream preview endpoint (`GET /file/*`)
- `apps/media-worker/src/routes/index.ts` — Route registry
- `apps/media-worker/test-fixtures.mjs` — Test fixtures with mock R2 and image generators
- `apps/media-worker/test-e2e.mjs` — Automated E2E test suite (7 scenarios)
- `.agents/teamwork/teamwork_worker_m2/changes.md` — Detailed changelog
- `.agents/teamwork/teamwork_worker_m2/handoff.md` — 5-component handoff report

## Change Tracker
- **Files modified**: None outside `apps/media-worker/`
- **Build status**: PASS (`wrangler deploy --dry-run --outdir=dist`)
- **Pending issues**: None

## Quality Status
- **Build/test result**: All 7 E2E tests PASS (100%)
- **Lint status**: 0 violations, all 17 files strictly <= 86 lines (limit 100), all functions <= 35 lines
- **Tests added/modified**: `apps/media-worker/test-e2e.mjs`, `apps/media-worker/test-fixtures.mjs`
