# Dispatch: Challenger 2 (Milestone 2 - Security, Limits & Storage Resilience Stress Testing)

## Assigned Role
- Archetype: teamwork_challenger
- State folder: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_challenger_m2_2

## Objective
Empirically stress-test the security controls, resource limits, and streaming behavior of `apps/media-worker`:
1. 10MB payload size limit: test payloads at 9.9MB, 10.0MB, 10.1MB, and 15MB. Verify that >10MB yields HTTP 413 (`FILE_TOO_LARGE`).
2. SSRF defense stress-testing against `POST /fetch-external`:
   - `http://127.0.0.1/evil.png`
   - `http://localhost:8080/image.jpg`
   - `http://10.0.0.1/pic.png`
   - `http://172.16.0.5/pic.png`
   - `http://192.168.1.1/pic.png`
   - `http://169.254.169.254/latest/meta-data/`
   - `http://[::1]/image.png`
   - Malformed URLs: `javascript:...`, `file:///etc/passwd`, `ftp://example.com/test.png`
   - Verify all malicious/internal targets are blocked with HTTP 400 (`SSRF_BLOCKED` or `INVALID_URL`).
3. `GET /file/*` preview stream: test with existing key, missing key (404), directory traversal attempt (`../../secret`).
4. Resilience: R2 storage exception handling and error JSON contract.

## Mandatory Inputs to Read
1. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\ORIGINAL_REQUEST.md` (Read in full)
2. `e:\lap_trinh\Project\website\KhangVietDesign\source\PROJECT.md`
3. `e:\lap_trinh\Project\website\KhangVietDesign\source\TEST_INFRA.md`
4. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_worker_m2\changes.md`
5. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_worker_m2\handoff.md`
6. `apps/media-worker/src/index.ts` and `apps/media-worker/src/services/ssrf-validator.ts`

## Challenger Instructions
- Write an empirical stress-test script (e.g. `apps/media-worker/test-stress-security.mjs`).
- Test all boundary conditions, security vectors, and error branches.
- Report all test cases run, pass/fail counts, and explicit verdict `APPROVE` or `REQUEST_CHANGES` in `handoff.md`.

## 2026-11-08T06:11:45Z
You are Challenger 2 stress-testing Milestone 2 (`apps/media-worker`).
State folder: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_challenger_m2_2
Working directory: e:\lap_trinh\Project\website\KhangVietDesign\source
