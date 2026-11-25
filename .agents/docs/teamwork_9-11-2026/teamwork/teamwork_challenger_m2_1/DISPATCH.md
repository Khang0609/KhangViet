# Dispatch: Challenger 1 (Milestone 2 - Image Ingestion & WebP Conversion Stress Testing)

## Assigned Role
- Archetype: teamwork_challenger
- State folder: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_challenger_m2_1

## Objective
Empirically stress-test the ingestion endpoints of `apps/media-worker` using adversarial test generators:
1. `POST /upload` with multipart form data (valid PNG, JPEG, corrupt binary files, non-image files like text/pdf).
2. `POST /upload` with raw binary blob (simulating clipboard paste Ctrl+V) with headers `Content-Type: image/png` and `image/jpeg`.
3. WebP conversion verification: verify the output binary buffer starts with RIFF magic bytes (`52 49 46 46`) and WebP fourCC (`57 45 42 50`).
4. Dimension extraction & aspect ratio classification stress testing: test 1x1, 1000x1, 1x1000, 3000x2000 (oversized image downscaling to <= 2560px).
5. Non-image or corrupted image rejection: verify HTTP 400 or HTTP 422 with proper error JSON structure.

## Mandatory Inputs to Read
1. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\ORIGINAL_REQUEST.md` (Read in full)
2. `e:\lap_trinh\Project\website\KhangVietDesign\source\PROJECT.md`
3. `e:\lap_trinh\Project\website\KhangVietDesign\source\TEST_INFRA.md`
4. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_worker_m2\changes.md`
5. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_worker_m2\handoff.md`
6. `apps/media-worker/src/index.ts` and `apps/media-worker/test-e2e.mjs`

## Challenger Instructions
- Write an empirical stress-test script (e.g. `apps/media-worker/test-stress-ingestion.mjs` or execute in-memory test).
- Test adversarial inputs: corrupt buffers, unsupported MIME types, oversized images, zero-byte uploads, boundary dimensions.
- Report all test cases run, pass/fail counts, and explicit verdict `APPROVE` or `REQUEST_CHANGES` in `handoff.md`.


## 2026-11-08T06:11:40Z
[Message] sender=9875b955-8c1f-4348-971a-46ec427f4059 priority=MESSAGE_PRIORITY_HIGH
content=You are Challenger 1 stress-testing Milestone 2 (`apps/media-worker`).
State folder: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_challenger_m2_1
Working directory: e:\lap_trinh\Project\website\KhangVietDesign\source
