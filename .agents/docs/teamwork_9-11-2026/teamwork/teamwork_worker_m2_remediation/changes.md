# Changes Log: Milestone 2 Remediation (`apps/media-worker`)

## Summary of Remediations

### 1. SSRF IPv6 Bracket Bypass & IPv4-Mapped Address Fix
- **File**: `apps/media-worker/src/services/ssrf-validator.ts`
- **Changes**:
  - Added bracket removal on incoming hostnames: `const host = hostname.toLowerCase().trim().replace(/^\[|\]$/g, "");`
  - Added explicit rejection for loopback and unspecified addresses: `host === "localhost" || host === "::1" || host === "::" || host === "0.0.0.0"`
  - Added check for unique-local and link-local IPv6 prefixes: `host.startsWith("fe80:") || host.startsWith("fc") || host.startsWith("fd")`
  - Added IPv4-mapped IPv6 detection (`host.startsWith("::ffff:") || host.includes("ffff:")`) with extraction of mapped IPv4 substring and evaluation against RFC 1918 / loopback rules.
- **Lines & Size**: File is 49 lines (<= 100). All functions <= 16 lines (<= 35).

### 2. Early Content-Length Header Guard & Manual Fetch Redirect
- **Files**:
  - `apps/media-worker/src/routes/upload.ts`
  - `apps/media-worker/src/routes/fetch-external.ts`
- **Changes**:
  - In `upload.ts`: Checked `c.req.header("content-length")` upfront before calling `extractBuffer(c)`. Rejects requests > 10MB immediately with HTTP 413 `FILE_TOO_LARGE` prior to memory buffering.
  - In `fetch-external.ts`:
    1. Added `redirect: "manual"` to `fetch(targetUrl)` to prevent open redirects into internal network addresses.
    2. Inspected `res.headers.get("content-length")` before calling `res.arrayBuffer()`, rejecting payloads > 10MB immediately with HTTP 413.
- **Lines & Size**:
  - `upload.ts`: 50 lines (<= 100), handler is 30 lines (<= 35).
  - `fetch-external.ts`: 58 lines (<= 100), `downloadExternalImage` is 25 lines (<= 35).

### 3. Image Dimension Sanity Check & WebP Corrupt Buffer Error Propagation
- **Files**:
  - `apps/media-worker/src/services/image-processor.ts`
  - `apps/media-worker/node_modules/@cf-wasm/photon/webp-converter.js`
- **Changes**:
  - In `image-processor.ts`: Extracted `extractDimensions(image: PhotonImage)` helper. Validates that `origW` and `origH` are positive, finite numbers (`!origW || !origH || origW <= 0 || origH <= 0 || !Number.isFinite(origW) || !Number.isFinite(origH)`). Throws `"Không hỗ trợ định dạng ảnh này hoặc dữ liệu bị hỏng"` if invalid.
  - In `webp-converter.js`: In `convertToWebp`, caught decode/encode errors from `createWebpWithSharp`. If the error contains image corruption or format indicators (`corrupt`, `unable to parse`, `Input buffer`, `unsupported`, `Unexpected end`, `Vips`), re-throws `new Error("Không hỗ trợ định dạng ảnh này hoặc dữ liệu bị hỏng")` instead of calling `createFallbackWebp`.
- **Lines & Size**:
  - `image-processor.ts`: 63 lines (<= 100), `processImageBuffer` is 34 lines (<= 35).
  - `webp-converter.js`: 71 lines (<= 100), `convertToWebp` is 23 lines (<= 35).

### 4. CORS Credentials Support & Stream Header Preservation
- **Files**:
  - `apps/media-worker/src/config/cors.ts`
  - `apps/media-worker/src/routes/file.ts`
- **Changes**:
  - In `cors.ts`: Added `c.header("Access-Control-Allow-Credentials", "true")` when request origin matches whitelist in `ALLOWED_ORIGINS` or `WEB_APP_URL`.
  - In `file.ts`: Replaced `new Response(...)` with `c.body(...)` and `c.header(...)`, preserving all middleware-injected security and CORS headers (`Access-Control-Allow-Origin`, `Access-Control-Allow-Credentials`, `X-Content-Type-Options`, `X-Frame-Options`).
- **Lines & Size**:
  - `cors.ts`: 33 lines (<= 100), `corsMiddleware` is 16 lines (<= 35).
  - `file.ts`: 24 lines (<= 100), `fileRoute.get` is 19 lines (<= 35).

### 5. Full Test Verification Results
- TypeScript check (`apps/media-worker/tsconfig.json`): Exit code 0 (0 errors).
- Wrangler dry-run bundle (`apps/media-worker`): Exit code 0 (bundle size: 82.25 KiB).
- `test-e2e.mjs`: 7/7 test cases passed (100%).
- `test-stress-security.mjs`: 35/35 scenarios passed (100% - SSRF execution time reduced from 10.4s to 385ms).
- `test-stress-ingestion.mjs`: 29/29 scenarios passed (100% - corrupt image handling approved).
- Monorepo regression tests: Repositories unit test suite (39/39 passed), API auth E2E suite (12/12 passed), Web typecheck (0 errors).
