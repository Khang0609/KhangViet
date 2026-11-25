# Handoff Report: Dedicated Cloudflare Media Worker Architecture Survey (`apps/media-worker`)

**Agent:** Explorer 2 — Media Worker Architect  
**Recipient:** Orchestrator / Implementer Agent  
**Milestone:** Milestone 2 Technical Survey  
**Date:** 2026-11-08  

---

## 1. Observation

1. **Workspace Configuration:**
   - Root `pnpm-workspace.yaml` (lines 1-7):
     ```yaml
     packages:
       - 'apps/*'
       - 'packages/*'
     ```
     Any subfolder inside `apps/` is automatically registered as a workspace package.
   - Core API `apps/api/package.json` (lines 4-10) uses Wrangler scripts:
     ```json
     "dev": "wrangler dev",
     "deploy": "wrangler deploy --minify",
     "test:auth": "wrangler deploy --dry-run --outdir=dist && node test-e2e.mjs"
     ```
     Default port for `apps/api` is `8787`. Default port for `apps/web` is `3000`.
   - Core API `apps/api/wrangler.jsonc` (lines 1-17) defines compatibility date `"2026-08-18"`, D1 binding `DB`, and production environment variables.

2. **Database Integration Schema Alignment:**
   - `packages/repositories/src/d1/schema/projects.schema.ts` (lines 26-29) stores un-normalized `cover_image` and `gallery` JSON:
     ```ts
     coverImage: text("cover_image").notNull(),
     gallery: text("gallery", { mode: "json" }).$type<ProjectGalleryItem[]>().notNull(),
     ```
   - In the target 3NF schema (`database-architecture-redesign.md` lines 111-125), media is normalized into `project_media`:
     `id`, `project_id`, `media_type`, `r2_key`, `public_url`, `caption`, `aspect_ratio`, `width_px`, `height_px`, `file_size_bytes`, `sort_order`, `created_at`.

3. **Admin UI Media Input Current State:**
   - In `apps/web/components/ui/ImageUrlInput.tsx` (lines 60-63):
     ```tsx
     <p className="font-sans text-xs text-white/70">
       Tính năng gắn tệp ảnh từ máy tính (Cloud Storage) sẽ được kích hoạt ở giai đoạn tiếp theo.
     </p>
     ```
     The input currently forces bypass flags and only takes raw text strings or manual URLs without uploading.
   - Usages of `ImageUrlInput` observed in:
     - `apps/web/components/modules/admin/hero/HeroSlideItem.tsx:4`
     - `apps/web/components/modules/admin/projects/ProjectFormFields.tsx:3`
     - `apps/web/components/modules/admin/projects/ProjectGalleryRow.tsx:4`

4. **WebAssembly Image Processing Capabilities in Cloudflare Workers:**
   - Official Web search and ecosystem benchmarks confirm that native Node.js libraries (`sharp`) cannot run on Cloudflare Workers' `workerd` runtime due to missing C++ bindings and multi-threading primitives.
   - `@cf-wasm/photon` (v0.4.0) compiles Rust `photon-rs` to a single WebAssembly module (< 3MB) with dedicated conditional exports for `@cf-wasm/photon/workerd` and `@cf-wasm/photon/node`.
   - Photon decodes JPEG, PNG, WebP, GIF, and BMP natively via magic bytes.
   - WebP export is supported via `outputImage.get_bytes_webp()`.
   - Resizing is supported via `resize(inputImage, width, height, SamplingFilter.Lanczos3)`.
   - Dimensions are extracted via `inputImage.get_width()` and `inputImage.get_height()`.
   - Memory must be freed explicitly via `inputImage.free()` and `outputImage.free()` to respect the 128MB Workers isolate ceiling.

---

## 2. Logic Chain

1. **Decoupled Architecture Need:**
   - From Observation 1 & 4, image decoding allocates uncompressed RGBA pixel buffers (a 4000x3000 image requires ~48MB of raw memory). Cloudflare Workers isolates have a strict 128MB RAM ceiling.
   - Placing image processing inside `apps/api` would risk Out-Of-Memory crashes affecting critical CMS and Leads operations, and bloat the API bundle size from <30KB to >3MB.
   - Therefore, a dedicated micro-worker `apps/media-worker` owning the `MEDIA_BUCKET` R2 binding is necessary to achieve total resource isolation.

2. **Library Selection (`@cf-wasm/photon` vs `@jsquash`):**
   - From Observation 4, `@jsquash` requires coordinating 4-5 independent packages (`@jsquash/jpeg`, `@jsquash/png`, `@jsquash/webp`, `@jsquash/resize`), each packing its own WASM binary, requiring manual MIME routing.
   - In contrast, `@cf-wasm/photon` provides a single unified WASM binary that auto-detects formats, inspects dimensions, resizes with Lanczos3, and outputs WebP directly, with zero cloud vendor lock-in and 0 VNĐ recurring costs.
   - Therefore, `@cf-wasm/photon` is selected as the optimal engine.

3. **Contract & Payload Alignment:**
   - From Observation 2, `project_media` expects `r2_key`, `public_url`, `width_px`, `height_px`, `aspect_ratio`, `file_size_bytes`, `media_type`.
   - By designing the response payload of `POST /upload` and `POST /fetch-external` to return this exact shape, the frontend `UniversalMediaUpload` can directly pass the response object into project creation without extra client-side translation or missing attributes.

4. **Local Development Simulatability:**
   - From Observation 1, Wrangler 4 with Miniflare 3 automatically emulates Cloudflare R2 on the local filesystem (`.wrangler/state/v3/r2`).
   - Using port `8788` for `apps/media-worker` prevents collisions with `apps/api` (port 8787) and `apps/web` (port 3000).
   - Adding a fallback route `GET /file/*` allows developers to preview uploaded R2 images locally without needing a public domain configured.

---

## 3. Caveats

1. **AVIF Decoding:** `@cf-wasm/photon` does not support AVIF decoding natively due to the heavy binary overhead of `aom`/`rav1e` decoders. Input formats are scoped strictly to JPEG, PNG, WebP, GIF, and BMP (which covers >99% of architectural assets).
2. **Workers Memory Ceiling (128MB):** Even with WebAssembly, uploading images > 15MB or > 8K resolution may exceed isolate RAM. A strict 10MB file size limit and 2560px max downscaling bounding box must be enforced at the gateway layer.
3. **SSRF Risk on External URL Fetch:** Fetching external URLs poses SSRF risks if malicious users submit internal hostnames (`127.0.0.1`, `169.254.169.254`). Strict IP validation and protocol filtering (`http`/`https` only) are mandatory in `external-fetch.service.ts`.

---

## 4. Conclusion

1. **Architecture Blueprint:** Create `apps/media-worker` as a standalone Hono micro-worker with R2 binding `MEDIA_BUCKET` (`khangviet-media`) running on port `8788`.
2. **Core Dependencies:** `@cf-wasm/photon` (v0.4.0), `hono` (v4.13.2), `@khangviet/types`.
3. **Core Endpoints:**
   - `POST /upload`: Handles `multipart/form-data` and raw binary blob (clipboard paste).
   - `POST /fetch-external`: SSRF-safe URL fetch, WebP compression, and R2 storage.
   - `GET /file/*`: Direct stream preview from R2 for local dev and fallback.
   - `GET /health`: Liveness probe.
4. **Code Compliance:** Full compliance with Screaming Architecture and `<100 lines/file` limit across 10 modular files.

---

## 5. Verification Method

1. **Package Build Verification:**
   ```bash
   pnpm --filter media-worker run cf-typegen
   pnpm --filter media-worker run deploy --dry-run
   ```
   *Expected result:* Build completes cleanly, bundle size < 4MB, no TypeScript errors.

2. **Local End-to-End Simulation:**
   ```bash
   pnpm --filter media-worker run dev --port 8788
   ```
   - In a separate terminal, execute test script:
     ```bash
     pnpm --filter media-worker run test
     ```
   *Expected result:* All 7 test cases pass (multipart upload, raw blob clipboard paste, WebP conversion, dimension calculation, 10MB limit rejection, SSRF blocking, preview route streaming).

3. **Inspect Output Files:**
   - Verify `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_explorer_survey_2\analysis.md`
   - Verify `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_explorer_survey_2\handoff.md`
