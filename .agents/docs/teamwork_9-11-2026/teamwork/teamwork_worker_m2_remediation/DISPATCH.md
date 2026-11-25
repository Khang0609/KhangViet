# Dispatch: Worker 4 (Milestone 2 Remediation Engineer)

## Mandatory Integrity Warning
> DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Assigned Role
- Archetype: teamwork_worker
- State folder: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_worker_m2_remediation
- Write ownership: Strictly within `apps/media-worker/` (and any related test fixtures). Do NOT touch files in `packages/repositories` or `apps/api` or `apps/web`.

## Mandatory Inputs to Read
1. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\ORIGINAL_REQUEST.md` (Read in full)
2. `e:\lap_trinh\Project\website\KhangVietDesign\source\PROJECT.md`
3. `e:\lap_trinh\Project\website\KhangVietDesign\source\TEST_INFRA.md`
4. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_reviewer_m2_1\handoff.md` (Reviewer 1 findings)
5. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_challenger_m2_1\handoff.md` (Challenger 1 findings)
6. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_challenger_m2_2\handoff.md` (Challenger 2 findings)
7. `.agents/rules/code-organization.md` (Hard limits: <= 100 lines/file, <= 35 lines/function)

## Concrete Remediation Tasks

### Task 1: Fix SSRF IPv6 Bracket Bypass (`apps/media-worker/src/services/ssrf-validator.ts`)
- Issue: WHATWG URL parser formats IPv6 hostnames with brackets `[fe80::1]`, `[fc00::1]`, `[::]`, `[::ffff:127.0.0.1]`.
- Fix:
  1. Strip enclosing brackets: `const cleanHost = host.replace(/^\[|\]$/g, "");`
  2. Block loopbacks and unspecified: `cleanHost === "localhost" || cleanHost === "::1" || cleanHost === "::" || cleanHost === "0.0.0.0"`
  3. Block IPv6 private prefixes: `cleanHost.startsWith("fe80:") || cleanHost.startsWith("fc") || cleanHost.startsWith("fd")`
  4. Block IPv4-mapped IPv6: `cleanHost.startsWith("::ffff:")` or `cleanHost.includes("ffff:")`
  5. Ensure function length is <= 35 lines and file length is <= 100 lines.

### Task 2: Fix 10MB Header Guard Before Heap Ingestion (`apps/media-worker/src/routes/upload.ts` & `fetch-external.ts`)
- In `src/routes/upload.ts`:
  Check `Content-Length` header upfront BEFORE calling `extractBuffer(c)`:
  ```ts
  const contentLength = Number(c.req.header("content-length"));
  if (contentLength && contentLength > MAX_FILE_SIZE_BYTES) {
    return c.json({ success: false, error: { code: "FILE_TOO_LARGE", message: "Dung lượng tệp vượt quá giới hạn 10MB" } }, 413);
  }
  ```
- In `src/routes/fetch-external.ts`:
  In `downloadExternalImage`:
  1. Inspect `res.headers.get("content-length")` before `res.arrayBuffer()`. If > `MAX_FILE_SIZE_BYTES`, throw 413 error.
  2. Set `redirect: "manual"` on `fetch(targetUrl)` so external URLs cannot redirect into internal infrastructure.

### Task 3: Fix Corrupt Image Handling & Dimension Sanity
- In `apps/media-worker/src/services/image-processor.ts`:
  1. After reading `origW = inputImage.get_width()` and `origH = inputImage.get_height()`, validate:
     ```ts
     if (!origW || !origH || origW <= 0 || origH <= 0 || !Number.isFinite(origW) || !Number.isFinite(origH)) {
       throw new Error("Không hỗ trợ định dạng ảnh này hoặc dữ liệu bị hỏng");
     }
     ```
  2. In `processImageBuffer`, ensure that if `@cf-wasm/photon` or WebP conversion fails/throws, the error is NOT swallowed into dummy headers.
- In `apps/media-worker/node_modules/@cf-wasm/photon/webp-converter.js`:
  In `convertToWebp`, if `createWebpWithSharp` throws a corruption or parse error (`err.message.includes("corrupt") || err.message.includes("unable to parse")`), do NOT fall back to `createFallbackWebp`. Re-throw so `uploadRoute` catches it and returns HTTP 415/422.

### Task 4: Fix CORS Credentials Support (`apps/media-worker/src/config/cors.ts`)
- In `corsMiddleware`:
  When origin is matched in allowed origins, add:
  `c.header("Access-Control-Allow-Credentials", "true");`
- In `src/routes/file.ts`:
  Ensure CORS headers are set on `GET /file/*` preview responses (e.g. use `c.body(...)` or attach CORS headers).

### Task 5: Build & Run Stress Suites
1. TypeScript check: `node ./node_modules/.pnpm/typescript@5.9.3/node_modules/typescript/bin/tsc --noEmit -p apps/media-worker/tsconfig.json`
2. Wrangler dry-run bundle: `cd apps/media-worker; .\node_modules\.bin\wrangler.ps1 deploy --dry-run --outdir=dist`
3. Run existing tests: `node apps/media-worker/test-e2e.mjs` (must pass 7/7)
4. Run security stress suite: `node apps/media-worker/test-stress-security.mjs` (must pass 35/35, 100%)
5. Run ingestion stress suite: `node apps/media-worker/test-stress-ingestion.mjs` (must pass 29/29, 100%)
6. Verify line counts: all `.ts` and test files must be <= 100 lines and all functions <= 35 lines.

## Deliverables
- `changes.md` in your state folder.
- `handoff.md` in your state folder with complete 5 components: Observation, Logic Chain, Caveats, Conclusion, Verification Method.
- Send completion message to parent when done.
