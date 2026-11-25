## 2026-11-08T07:17:36Z

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

# Assignment: Milestone 3 Remediation (Admin UI Universal Media Dropzone & AST Compliance)

## Context & Objectives
You are Worker 6 (Admin UI Remediation Implementer).
Milestone 3 Iteration 1 failed the Forensic Integrity Audit because 4 functions exceeded the hard limit of 35 lines per function (.agents/rules/code-organization.md §4), and the test script `apps/web/test-media-upload.mjs` duplicated `toMediaResult` locally instead of genuinely importing from `types.ts`.
Explorer 7 has completed a full pre-validated architectural blueprint that resolves every issue with zero violations.

## Authoritative Reference Documents (Read FIRST):
1. `ORIGINAL_REQUEST.md`: `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\ORIGINAL_REQUEST.md`
2. `PROJECT.md`: `e:\lap_trinh\Project\website\KhangVietDesign\source\PROJECT.md`
3. Explorer 7 Remediation Blueprint (Contains EXACT code specifications in Sections 4.1 & 4.2):
   `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_explorer_m3_remediation\handoff.md`

## Your State Folder:
`e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_worker_m3_remediation`

## Implementation Tasks (Execute in order from Explorer 7 blueprint):
1. **Create `apps/web/components/ui/media-upload/mediaUploadService.ts`** (57 lines):
   Extract `getMediaWorkerUrl`, `uploadFileToWorker`, `fetchExternalUrlFromWorker`, `extractImageFromPaste`.
2. **Refactor `apps/web/components/ui/media-upload/useMediaUpload.ts`** (59 lines, max function 24 lines):
   Delegate network and paste operations to `mediaUploadService.ts`. Ensure `useUploadState` and `useMediaUpload` each remain <= 25 lines.
3. **Refactor `apps/web/components/ui/media-upload/MediaDropzoneView.tsx`** (87 lines, max function 26 lines):
   Extract `DropzoneUploading`, `DropzoneIdle`, `DropzoneFileInput`, and `useDropzoneDrag`.
4. **Refactor `apps/web/components/ui/media-upload/MediaUrlFetchBar.tsx`** (74 lines, max function 29 lines):
   Extract `UrlSubmitBtn` and `UrlInputField`. Do NOT clear `inputUrl` prematurely before async fetch finishes.
5. **Refactor `apps/web/components/ui/media-upload/UniversalMediaUpload.tsx`** (83 lines, max function 25 lines):
   Extract `UploadHeader`, `ErrorBanner`, `DropzoneContainer`, and `useUniversalHandlers`. Filter paste events when target is `<input>`.
6. **Update `apps/web/components/ui/media-upload/index.ts`** (8 lines):
   Export all modules including `mediaUploadService`.
7. **Update `apps/web/test-media-upload.mjs`** (~120 lines):
   Dynamically import `types.ts` and `mediaUploadService.ts` via `ts.transpileModule` (no local mock facades). Integrate TypeScript AST function length checks for all files.

## Strict Constraints:
- HARD LIMIT: Every file must be <= 100 lines.
- HARD LIMIT: Every function (including enclosing functions containing arrow callbacks) must be <= 35 lines.
- Enforce Tailwind CSS v4 syntax (bg-(--accent-bronze), border-white/8, aspect-video, focus:outline-hidden). No v3 syntax!
- 100% backward compatibility for `ImageUrlInput.tsx` and all consumers.

## Mandatory Verification Commands to Run:
Run and verify output of:
1. `node apps/web/test-media-upload.mjs` (must pass 100%, 0 AST length violations)
2. `node apps/web/test-stress-dropzone.mjs` (must pass 22/22 tests)
3. `node .agents/teamwork/teamwork_auditor_m3_1/audit-check.mjs` (must output CLEAN, 0 violations)
4. `node ./node_modules/.pnpm/typescript@5.9.3/node_modules/typescript/bin/tsc --noEmit -p apps/web/tsconfig.json` (exit 0)
5. `cmd.exe /c "if exist apps\web\.next rmdir /s /q apps\web\.next && cd apps\web && npx next build --webpack"` (must succeed with 7/7 static routes generated)

## Deliverables:
- Write `handoff.md` in your state folder with complete verification commands, outputs, line counts, and AST results.
- Send a completion message via `send_message` to orchestrator (`9875b955-8c1f-4348-971a-46ec427f4059`).
