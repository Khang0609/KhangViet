# E2E Test Infra: Khang Viet Design Redesign

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation internals.
- Verification of database integrity, media worker uploads & WebP conversion, admin dropzone UI, and monorepo build stability.

## Feature Inventory Coverage
| # | Feature | Source (Requirement) | Tier 1 (Feature) | Tier 2 (Boundary) | Tier 3 (Cross) |
|---|---------|----------------------|:----------------:|:-----------------:|:--------------:|
| 1 | Party/Identity Model | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 2 | Projects & Media 3NF | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 3 | D1 Migrations & Seeds | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 4 | Repository Adapters | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 5 | Media Worker Uploads | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 6 | WebP Conversion Engine | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 7 | External URL & SSRF | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 8 | Universal Media Dropzone | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 9 | Admin CMS Integration | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 10| Monorepo Build Stability | ORIGINAL_REQUEST §AC | 5 | 5 | ✓ |

## Test Architecture
- **Repository & Schema Tests**: `pnpm --filter @khangviet/repositories test` (Node.js test runner verifying UUIDv7, Party/Identity constraints, ON DELETE RESTRICT, ON DELETE CASCADE, project_media specs).
- **API E2E Tests**: `pnpm --filter api test:auth` (12 automated scenarios verifying JWT login, PBKDF2 hash, RBAC, refresh cookie rotation, protected routes).
- **Media Worker E2E Tests**: `pnpm --filter media-worker run test` (test suite verifying multipart file upload, raw blob clipboard paste, WebP conversion, dimensions inspection, SSRF prevention, 10MB limit).
- **Web Typecheck & Build**: `pnpm --filter web exec tsc --noEmit` & `pnpm --filter web build` (verifying 0 type errors and successful Next.js static ISR generation).
- **Monorepo Build**: `pnpm --filter @khangviet/repositories build`, `pnpm --filter api build`, `pnpm --filter web build`, `pnpm --filter media-worker build`.

## Pass/Fail Criteria
- Exit code 0 on all test and build commands.
- Zero data loss or display regression on existing project showcases and lightbox modals.
