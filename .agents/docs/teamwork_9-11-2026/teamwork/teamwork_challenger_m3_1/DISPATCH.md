# Dispatch: Challenger (Milestone 3 - Admin UI Media Dropzone Empirical Challenger)

## Assigned Role
- Archetype: teamwork_challenger
- State folder: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_challenger_m3_1

## Objective
Empirically challenge the functionality, edge cases, and boundary behaviors of `UniversalMediaUpload` and `useMediaUpload`:
1. 4 upload modes: Browse file dialog, Drag-and-drop, Clipboard paste (image blob vs image URL), External URL fetch.
2. Error handling: file > 10MB rejection on client before upload, invalid URL format, network upload failure recovery.
3. Aspect ratio and metadata pills rendering.
4. Backward compatibility: verify that existing forms submitting relative paths (`/image/projects/...`) or external URLs still function properly.

## Mandatory Inputs to Read
1. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\ORIGINAL_REQUEST.md` (Read in full)
2. `e:\lap_trinh\Project\website\KhangVietDesign\source\PROJECT.md`
3. `e:\lap_trinh\Project\website\KhangVietDesign\source\TEST_INFRA.md`
4. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_worker_m3_1\changes.md`
5. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_worker_m3_1\handoff.md`

## Tasks
1. Write and execute an adversarial component stress script (e.g. `apps/web/test-stress-dropzone.mjs`):
   - Test `useMediaUpload` hook state transitions (`idle` -> `uploading` -> `success` / `error`).
   - Test client-side size guard: payload > 10MB returns error without dispatching network request.
   - Test clipboard paste parsing: raw image blob vs URL text vs non-image text.
   - Test `toMediaResult` contract transformation with various aspect ratios and dimension payloads.
2. Run `node apps/web/test-media-upload.mjs` and monorepo regression checks.
3. Write your report with test cases, pass/fail counts, and explicit verdict `APPROVE` or `REQUEST_CHANGES` in `handoff.md` in your state folder.


## 2026-11-08T06:51:42Z
You are Challenger stress-testing Milestone 3 (`apps/web` Admin UI Universal Media Dropzone).
State folder: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_challenger_m3_1
Working directory: e:\lap_trinh\Project\website\KhangVietDesign\source

Read:
1. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\ORIGINAL_REQUEST.md` (MANDATORY: Read in full)
2. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_challenger_m3_1\DISPATCH.md`
3. `e:\lap_trinh\Project\website\KhangVietDesign\source\PROJECT.md`
4. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_worker_m3_1\changes.md`
5. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_worker_m3_1\handoff.md`

Perform:
- Empirically test `useMediaUpload` hook state transitions, upload methods, clipboard parsing (image blobs vs image URLs), 10MB size guard, error recovery.
- Write and run an adversarial test script (e.g. `apps/web/test-stress-dropzone.mjs`).
- Run `node apps/web/test-media-upload.mjs` and monorepo regression checks.
- Report all test cases, pass/fail counts, and explicit verdict `APPROVE` or `REQUEST_CHANGES` to `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_challenger_m3_1\handoff.md`.
- Message parent with your verdict and report path.
