# Dispatch: Explorer 7 (Milestone 3 Remediation Architect)

## Mandatory Inputs to Read
1. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\ORIGINAL_REQUEST.md` (Read in full)
2. `e:\lap_trinh\Project\website\KhangVietDesign\source\PROJECT.md`
3. `e:\lap_trinh\Project\website\KhangVietDesign\source\TEST_INFRA.md`
4. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_auditor_m3_1\handoff.md` (FULL Forensic Auditor Evidence Report - MANDATORY)
5. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_reviewer_m3_1\handoff.md` (Reviewer Report)
6. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_challenger_m3_1\handoff.md` (Challenger Report)
7. `.agents/rules/code-organization.md` (Section 4: Hard limits of <= 100 lines/file and <= 35 lines/function)
8. Existing implementation files in `apps/web/components/ui/media-upload/`:
   - `types.ts`
   - `useMediaUpload.ts`
   - `MediaDropzoneView.tsx`
   - `MediaPreviewCard.tsx`
   - `MediaUrlFetchBar.tsx`
   - `UniversalMediaUpload.tsx`
   - `index.ts`
   - `../ImageUrlInput.tsx`

## Forensic Audit Integrity Violations to Remediate
The Forensic Auditor reported INTEGRITY VIOLATION with 4 violating functions exceeding the 35 lines hard ceiling:
1. `apps/web/components/ui/media-upload/useMediaUpload.ts`: `useMediaUpload` spans 86 lines (lines 9–94, limit <= 35).
   - Cause: Network request logic, FormData creation, and paste parsing are embedded directly inside the hook body.
   - Recommended strategy: Extract a standalone service file `mediaUploadService.ts` (or `upload-client.ts`) containing pure async functions `uploadFileToWorker(file, folder)` and `fetchExternalUrlFromWorker(url, folder)`. Hook body `useMediaUpload` will then simply coordinate state transitions and call these external functions in <= 30 lines.
2. `apps/web/components/ui/media-upload/MediaDropzoneView.tsx`: `MediaDropzoneView` spans 39 lines (lines 36–74, limit <= 35).
   - Recommended strategy: Extract the inner container or text hint into a dedicated sub-component (`DropzonePrompt` or similar) so `MediaDropzoneView` is <= 30 lines.
3. `apps/web/components/ui/media-upload/MediaUrlFetchBar.tsx`: `MediaUrlFetchBar` spans 36 lines (lines 28–63, limit <= 35).
   - Recommended strategy: Extract the input field or URL button handler into sub-component, and fix the UX issue where `inputUrl` was wiped out prematurely before async fetch finishes.
4. `apps/web/components/ui/media-upload/UniversalMediaUpload.tsx`: `UniversalMediaUpload` spans 37 lines (lines 48–84, limit <= 35).
   - Recommended strategy: Extract the view switcher or card wrapper into sub-component so `UniversalMediaUpload` is <= 30 lines.
5. Test Script Integrity:
   - `apps/web/test-media-upload.mjs` duplicated `toMediaResult` locally. The test must genuinely import from `types.ts` (or use a valid runner) and MUST include automated AST function length checking (`audit-check.mjs`).

## Explorer Mission
Design a concrete, line-by-line refactoring plan for Worker 6:
- Specify exact new file(s) and their line counts (all <= 100 lines).
- Specify exact line counts and structures for all refactored functions (all <= 30 lines, well below the 35 hard ceiling).
- Specify the automated test script updates.
- Write your report to `handoff.md` in your state folder (`.agents/teamwork/teamwork_explorer_m3_remediation/handoff.md`).
- Message parent with report path.
