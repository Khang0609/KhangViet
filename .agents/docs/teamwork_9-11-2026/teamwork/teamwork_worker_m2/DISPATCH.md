## 2026-11-08T05:43:53Z
You are Worker 3: Cloudflare Media Worker Engineer for Milestone 2 (`apps/media-worker`).

Your task is to implement the dedicated Cloudflare Media Worker micro-service according to the specifications in ORIGINAL_REQUEST.md, PROJECT.md, and Explorer 2's authoritative blueprint.

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Authoritative Inputs
- Read ORIGINAL_REQUEST.md at: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\ORIGINAL_REQUEST.md
- Read PROJECT.md at: e:\lap_trinh\Project\website\KhangVietDesign\source\PROJECT.md
- Read Explorer 2 Blueprint & Analysis: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_explorer_survey_2\analysis.md
- Read Explorer 2 Handoff: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_explorer_survey_2\handoff.md
- Working Directory: e:\lap_trinh\Project\website\KhangVietDesign\source
- Your State Folder: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_worker_m2

## Exclusive File Ownership
You own and may create/modify files under `apps/media-worker/`:
- `apps/media-worker/package.json`
- `apps/media-worker/wrangler.jsonc`
- `apps/media-worker/tsconfig.json`
- `apps/media-worker/src/index.ts`
- `apps/media-worker/src/routes/*` (`upload.ts`, `fetch-external.ts`, `file.ts`, `health.ts`, `index.ts`)
- `apps/media-worker/src/services/*` (`image-processor.ts`, `r2-storage.ts`, `ssrf-validator.ts`, `types.ts`)
- `apps/media-worker/src/config/*` (`cors.ts`, `limits.ts`)
- `apps/media-worker/test-e2e.mjs`

## Specific Requirements
1. **Scaffold `apps/media-worker`**:
   - `package.json`: Hono v4 (`hono`), `@cf-wasm/photon` (v0.4.0), `@khangviet/types`, devDependencies: `wrangler`, `@cloudflare/workers-types`. Include `"build": "wrangler deploy --dry-run --outdir=dist"`, `"dev": "wrangler dev --port 8788"`, `"test": "node test-e2e.mjs"`.
   - `wrangler.jsonc`: name `"media-worker"`, main `"src/index.ts"`, compatibility_date `"2026-08-18"`, r2_buckets `[ { "binding": "MEDIA_BUCKET", "bucket_name": "khangviet-media" } ]`, vars `WEB_APP_URL` `"https://khangviet.vn"`.
   - `tsconfig.json`: Cloudflare Workers types configuration.
2. **WASM WebP Compression & Image Optimization (`src/services/image-processor.ts`)**:
   - Integrate `@cf-wasm/photon` (targeting `@cf-wasm/photon/workerd`).
   - Decode input buffer (JPEG, PNG, WebP, GIF, BMP).
   - Inspect dimensions: `width_px`, `height_px`, calculate `aspect_ratio` ('landscape' | 'portrait' | 'square' | 'wide').
   - Resize if width or height exceeds 2560px (Lanczos3).
   - Encode to WebP: `get_bytes_webp()`.
   - Free WebAssembly memory explicitly (`inputImage.free()`, `outputImage.free()`).
   - Max file limit: 10MB (reject larger files with 413 Payload Too Large).
3. **Core Endpoints (`src/routes/`)**:
   - `POST /upload`: handles `multipart/form-data` (file field) AND raw binary blob (Content-Type `image/*`, for clipboard paste). Converts to WebP, writes to R2 (`projects/{uuid}.webp`), returns JSON payload matching `project_media` contract: `{ success: true, data: { public_url, r2_key, width_px, height_px, aspect_ratio, file_size_bytes, media_type: "GALLERY_IMAGE" } }`.
   - `POST /fetch-external`: JSON body `{ "url": string }`. Uses `ssrf-validator.ts` to block loopback (`127.0.0.1`, `localhost`), private IPs (RFC1918), and metadata IP (`169.254.169.254`). Fetches external image, compresses to WebP, stores in R2, returns same payload.
   - `GET /file/*`: streams image directly from R2 `c.env.MEDIA_BUCKET.get(key)` with `Content-Type: image/webp` and caching headers (`Cache-Control: public, max-age=31536000, immutable`).
   - `GET /health`: returns `{ status: "ok", service: "media-worker", timestamp }`.
   - CORS: Enable CORS allowing all origins (`*`) or `apps/web` origin (`http://localhost:3000`, `http://127.0.0.1:3000`, `https://khangviet.vn`) for preflight OPTIONS and POST.
4. **Automated Integration Test Suite (`test-e2e.mjs`)**:
   - Write a self-contained Node.js test script using Miniflare / Wrangler local dev or in-memory R2 mock verifying:
     a) Health check (`GET /health`)
     b) Multipart upload with PNG/JPEG sample converted to WebP
     c) Raw binary blob upload (clipboard paste simulation) converted to WebP
     d) Dimension and aspect ratio extraction
     e) 10MB file limit rejection
     f) SSRF blocking on external fetch (`http://127.0.0.1`, `http://169.254.169.254`)
     g) File stream preview route (`GET /file/*`)
5. **Code Standards**:
   - Every file must be strictly <= 100 lines (split helpers into separate files if needed).
   - Every function must be strictly <= 35 lines.
   - Measure and report exact line counts in `handoff.md`.

## Deliverables
- Write `changes.md` and `handoff.md` in your state folder.
- Run build and test commands and document exact outputs.
- Send completion message to orchestrator via `send_message`.
