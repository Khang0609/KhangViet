# BRIEFING — 2026-11-08T07:05:00Z

## Mission
Adversarial empirical stress-testing of Milestone 3 (`apps/web` Admin UI Universal Media Dropzone & `useMediaUpload` hook).

## 🔒 My Identity
- Archetype: teamwork_challenger
- Roles: critic, specialist
- Working directory: e:\lap_trinh\Project\website\KhangVietDesign\source
- State folder: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_challenger_m3_1
- Original parent: 9875b955-8c1f-4348-971a-46ec427f4059
- Milestone: Milestone 3
- Instance: 1 of 1

## 🔒 Key Constraints
- Review-only — do NOT modify implementation code
- Run all tests directly (empirical verification required)
- Never store test scripts or temporary files in `.agents/teamwork/`
- All verdicts must be grounded in executed test code

## Current Parent
- Conversation ID: 9875b955-8c1f-4348-971a-46ec427f4059
- Updated: not yet

## Review Scope
- **Files to review**:
  - `apps/web/components/ui/media-upload/types.ts`
  - `apps/web/components/ui/media-upload/useMediaUpload.ts`
  - `apps/web/components/ui/media-upload/MediaDropzoneView.tsx`
  - `apps/web/components/ui/media-upload/MediaPreviewCard.tsx`
  - `apps/web/components/ui/media-upload/MediaUrlFetchBar.tsx`
  - `apps/web/components/ui/media-upload/UniversalMediaUpload.tsx`
  - `apps/web/components/ui/media-upload/index.ts`
  - `apps/web/components/ui/ImageUrlInput.tsx`
  - `apps/web/test-media-upload.mjs`
  - `apps/web/test-stress-dropzone.mjs`
- **Interface contracts**: `PROJECT.md`, `packages/types/src/media.ts`, `.agents/rules/code-organization.md`, `.agents/rules/tailwindcss-v4.md`
- **Review criteria**: correctness, empirical edge cases, state transitions, backward compatibility, 10MB guard, error recovery, UI limits

## Attack Surface
- **Hypotheses tested**:
  - 10MB boundary tests (10MB allowed, 10MB + 1 byte rejected without network dispatch, 50MB rejected, 0 bytes allowed to server).
  - State machine transitions (`idle` -> `uploading` -> `success` / `error` -> `reset()`).
  - Error recovery upon network drop or server 500 HTML non-JSON crash.
  - URL format validation (blocking ftp, file, javascript, data URLs, relative paths).
  - Clipboard paste parsing (image blob -> file upload; URL text -> url fetch; plain text -> passthrough without preventDefault).
  - `toMediaResult` contract transformation across all 4 aspect ratios and extreme dimensions.
  - `formatSize` boundary behavior (undefined, 0, 512B, 1024B, 1048575B, 1MB, 2.5MB, 10MB).
  - Local path bypass in `MediaUrlFetchBar` with `allowManualInput`.
  - Code organization hard limits ($\le 100$ lines/file, $\le 35$ lines/function).
- **Vulnerabilities found**:
  1. `apps/web/components/ui/media-upload/useMediaUpload.ts`: `useMediaUpload()` function length is 86 lines (lines 9–94), violating the 35 lines hard limit in `.agents/rules/code-organization.md` §4.
  2. `apps/web/components/ui/media-upload/MediaUrlFetchBar.tsx`: UX flaw where `inputUrl` is cleared immediately upon submit before async fetch completes, resulting in lost URL if the fetch fails.
- **Untested angles**: Live browser DOM user-event simulation (simulated via Node.js event harness).

## Loaded Skills
- None specified in dispatch

## Key Decisions Made
- Created and executed empirical stress test suite `apps/web/test-stress-dropzone.mjs` (22 tests across 8 suites).
- Confirmed 21 tests pass, 1 test fails (function length violation).
- Issued verdict: `REQUEST_CHANGES` to refactor `useMediaUpload.ts` and fix URL input clearing in `MediaUrlFetchBar.tsx`.

## Artifact Index
- `.agents/teamwork/teamwork_challenger_m3_1/BRIEFING.md`
- `.agents/teamwork/teamwork_challenger_m3_1/progress.md`
- `.agents/teamwork/teamwork_challenger_m3_1/handoff.md`
- `apps/web/test-stress-dropzone.mjs`
