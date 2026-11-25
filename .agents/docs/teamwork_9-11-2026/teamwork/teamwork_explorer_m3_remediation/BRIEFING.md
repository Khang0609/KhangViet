# BRIEFING — 2026-11-08T07:09:00Z

## Mission
Formulate a precise, non-breaking refactoring blueprint addressing all 4 function length violations (<= 35 lines ceiling) and the test integrity issue found during Milestone 3 Forensic Audit.

## 🔒 My Identity
- Archetype: explorer
- Roles: Milestone 3 Remediation Architect
- Working directory: e:\lap_trinh\Project\website\KhangVietDesign\source
- State folder: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_explorer_m3_remediation
- Original parent: 9875b955-8c1f-4348-971a-46ec427f4059
- Milestone: Milestone 3 Remediation Architecture

## 🔒 Key Constraints
- Read-only investigation — do NOT implement / modify source code directly
- Hard limits: <= 100 lines/file and <= 35 lines/function (target <= 30 lines for safety margin)
- Exact file layouts, modular decomposition, and test integrity restoration
- Vietnamese response when requested, follow team handoff protocol

## Current Parent
- Conversation ID: 9875b955-8c1f-4348-971a-46ec427f4059
- Updated: 2026-11-08T07:09:00Z

## Investigation State
- **Explored paths**:
  - `ORIGINAL_REQUEST.md`, `PROJECT.md`, `TEST_INFRA.md`
  - Auditor Report: `.agents/teamwork/teamwork_auditor_m3_1/handoff.md`
  - Reviewer Report: `.agents/teamwork/teamwork_reviewer_m3_1/handoff.md`
  - Challenger Report: `.agents/teamwork/teamwork_challenger_m3_1/handoff.md`
  - Existing files under `apps/web/components/ui/media-upload/` (`types.ts`, `useMediaUpload.ts`, `MediaDropzoneView.tsx`, `MediaPreviewCard.tsx`, `MediaUrlFetchBar.tsx`, `UniversalMediaUpload.tsx`, `index.ts`, `ImageUrlInput.tsx`)
  - Test scripts: `apps/web/test-media-upload.mjs`, `apps/web/test-stress-dropzone.mjs`, `.agents/teamwork/teamwork_auditor_m3_1/audit-check.mjs`
- **Key findings**:
  1. AST Analysis confirmed exact violations: `useMediaUpload` (86 lines), `MediaDropzoneView` (39 lines), `MediaUrlFetchBar` (36 lines), `UniversalMediaUpload` (37 lines).
  2. Outer function line spans in TypeScript AST encompass all nested `useCallback` and helper callbacks, which is why inlining network logic ballooned `useMediaUpload` to 86 lines.
  3. Extracting `mediaUploadService.ts` (pure network requests & paste parsing) reduces `useMediaUpload` to 23 lines and decouples network calls from React hooks.
  4. Trimming sub-components (`useDropzoneDrag` & `DropzoneFileInput` in `MediaDropzoneView.tsx`, `UrlInputField` in `MediaUrlFetchBar.tsx`, `useUniversalHandlers` in `UniversalMediaUpload.tsx`) brings all component functions to $\le 26$ lines (target $\le 30$, limit $\le 35$).
  5. Tested blueprint via `test-blueprint-ast.mjs` and achieved 0 AST violations and 100% compliance with file line limits ($\le 87$ lines).
  6. Tested Next.js production build (`next build --webpack`): exited with code 0 after clearing stale `.next` lock cache.
  7. Test script integrity: dynamically loading genuine `types.ts` and `mediaUploadService.ts` via `ts.transpileModule` in `test-media-upload.mjs` eliminates fake local mock `toMediaResult` and integrates automated AST line checks.
- **Unexplored areas**: None. All components, contracts, build behaviors, and test harnesses have been empirically measured and validated.

## Key Decisions Made
- Architecture decision: Introduce `apps/web/components/ui/media-upload/mediaUploadService.ts` containing pure async functions `uploadFileToWorker`, `fetchExternalUrlFromWorker`, `extractImageFromPaste`, and `getMediaWorkerUrl`.
- Architecture decision: Refactor `useMediaUpload.ts` to utilize an internal `useUploadState()` helper (24 lines) and lean hook `useMediaUpload()` (23 lines).
- Architecture decision: Extract `DropzoneFileInput` & `useDropzoneDrag` in `MediaDropzoneView.tsx` to trim `MediaDropzoneView` from 39 to 26 lines.
- Architecture decision: Extract `UrlInputField` in `MediaUrlFetchBar.tsx` and preserve `inputUrl` on external fetch to fix UX premature erasure, trimming `MediaUrlFetchBar` from 36 to 29 lines.
- Architecture decision: Extract `useUniversalHandlers` in `UniversalMediaUpload.tsx` and prevent paste event hijacking on `<input>` tags, trimming `UniversalMediaUpload` from 37 to 25 lines.
- Test Architecture decision: Upgrade `apps/web/test-media-upload.mjs` to dynamically load genuine TS files, verify `mediaUploadService.ts`, and embed full AST function length validation.

## Artifact Index
- `DISPATCH.md` — Task assignment & audit violation summary
- `BRIEFING.md` — Persistent context & state
- `progress.md` — Liveness heartbeat
- `test-blueprint-ast.mjs` — Empirical AST verification script for blueprint code
- `handoff.md` — Comprehensive remediation blueprint report
