# Handoff Report: Challenger 1 — Stress Testing Milestone 2 (`apps/media-worker`)

**Challenger:** Challenger 1 (critic, specialist)  
**Recipient:** Orchestrator (`9875b955-8c1f-4348-971a-46ec427f4059`) & Worker M2  
**Milestone:** Milestone 2 (`apps/media-worker`)  
**Verdict:** **`REQUEST_CHANGES`**  
**Date:** 2026-11-08  

---

## 1. Observation

1. **Test Harness & Adversarial Test Implementation:**
   - Designed and executed an empirical adversarial stress test harness located co-located in `apps/media-worker/`:
     - `apps/media-worker/test-stress-generators.mjs` (45 lines)
     - `apps/media-worker/test-stress-assertions.mjs` (68 lines)
     - `apps/media-worker/test-stress-blobs.mjs` (62 lines)
     - `apps/media-worker/test-stress-ingestion.mjs` (57 lines)
   - All files strictly adhere to `< 100` lines/file and `< 35` lines/function limits.

2. **Test Execution Command & Verbatim Output:**
   - Executing command: `node apps/media-worker/test-stress-ingestion.mjs`
   ```text
   ==================================================================
   === EMPIRICAL STRESS TEST SUITE: MEDIA WORKER INGESTION & WEBP ===
   ==================================================================

   --- [Suite 1: Multipart Form Uploads & Adversarial Buffers] ---
   ✔ [PASS] MP-01 Valid PNG Upload -> status=200
   ✔ [PASS] MP-02 Missing File Field -> status=400
   ✔ [PASS] MP-03 Zero Bytes File -> status=400
   ✔ [PASS] MP-04 Plain Text File -> status=415
   ✔ [PASS] MP-05 PDF File -> status=415
   ✔ [PASS] MP-06 Corrupt JPEG Buffer -> status=415
   ✖ [FAIL] MP-07 Corrupt PNG Buffer -> status=200, success=true
   ✖ [FAIL] MP-08 Corrupt GIF Buffer -> status=200, success=true
   ✖ [FAIL] MP-09 Corrupt BMP Buffer -> status=200, success=true
   ✔ [PASS] MP-10 Random Garbage Buffer -> status=415

   --- [Suite 2: Raw Binary Blob Clipboard Paste (Ctrl+V)] ---
   ✔ [PASS] RB-01 Valid JPEG Raw Blob -> status=200
   ✔ [PASS] RB-02 Zero Bytes Raw Body -> status=400
   ✔ [PASS] RB-03 Plain Text Raw Body -> status=415
   ✔ [PASS] RB-04 Corrupt JPEG Raw Body -> status=415
   ✖ [FAIL] RB-05 Corrupt PNG Raw Body -> status=200, success=true

   --- [Suite 3: Aspect Ratio & Boundary / Downscaling Tests] ---
   ✔ [PASS] DIM-1x1 (square) -> status=200, dim=1x1, aspect=square
   ✔ [PASS] DIM-1000x1 (wide) -> status=200, dim=1000x1, aspect=wide
   ✔ [PASS] DIM-1x1000 (portrait) -> status=200, dim=1x1000, aspect=portrait
   ✔ [PASS] DIM-500x500 (square) -> status=200, dim=500x500, aspect=square
   ✔ [PASS] DIM-104x100 (square) -> status=200, dim=104x100, aspect=square
   ✔ [PASS] DIM-1600x1200 (landscape) -> status=200, dim=1600x1200, aspect=landscape
   ✔ [PASS] DIM-1920x800 (wide) -> status=200, dim=1920x800, aspect=wide
   ✔ [PASS] DIM-800x1200 (portrait) -> status=200, dim=800x1200, aspect=portrait
   ✔ [PASS] DIM-2560x2560 (square) -> status=200, dim=2560x2560, aspect=square
   ✔ [PASS] DIM-3000x2000 (landscape) -> status=200, dim=2560x1707, aspect=landscape
   ✔ [PASS] DIM-2000x3000 (portrait) -> status=200, dim=1707x2560, aspect=portrait
   ✔ [PASS] DIM-3200x3200 (square) -> status=200, dim=2560x2560, aspect=square

   --- [Suite 4: WebP Magic Bytes RIFF/WEBP Verification] ---
   ✔ [PASS] WEBP-01 Stored Object RIFF/WEBP Magic Bytes -> key=projects/...webp
   ✔ [PASS] WEBP-02 Preview Stream RIFF/WEBP Magic Bytes -> status=200

   ==================================================================
   TOTAL TESTS: 29 | PASSED: 25 | FAILED: 4
   ==================================================================

   >>> EMPIRICAL CHALLENGER VERDICT: REQUEST_CHANGES (4 tests failed) <<<
     - Failed: MP-07 Corrupt PNG Buffer (status=200, success=true)
     - Failed: MP-08 Corrupt GIF Buffer (status=200, success=true)
     - Failed: MP-09 Corrupt BMP Buffer (status=200, success=true)
     - Failed: RB-05 Corrupt PNG Raw Body (status=200, success=true)
   ```

3. **Exact Code Cause Observed in `apps/media-worker/node_modules/@cf-wasm/photon/webp-converter.js` (lines 49-60):**
   ```js
   export function convertToWebp(bytes, width, height) {
     const isWebp = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57;
     if (isWebp && !width && !height) return bytes;
     try {
       if (typeof process !== "undefined" && process?.execPath) {
         return createWebpWithSharp(bytes, width, height);
       }
     } catch (err) {
       console.warn("Sharp fallback:", err?.message || err);
     }
     return createFallbackWebp(bytes, width, height);
   }
   ```
   When `createWebpWithSharp` fails because the input image is corrupted (`Error: Input buffer has corrupt header: webp: unable to parse image`), `convertToWebp` swallows the error in the catch block and calls `createFallbackWebp(bytes, width, height)`.

4. **Exact Code Cause Observed in `apps/media-worker/node_modules/@cf-wasm/photon/webp-converter.js` (lines 34-47):**
   ```js
   function createFallbackWebp(bytes, width, height) {
     const riff = [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50];
     const vp8 = [0x56, 0x50, 0x38, 0x20, 0, 0, 0, 0];
     const payload = bytes.slice(0, Math.min(bytes.length, 128));
     const total = riff.length + vp8.length + payload.length;
     const out = new Uint8Array(total);
     out.set(riff, 0);
     out.set(vp8, 12);
     out.set(payload, 20);
     const view = new DataView(out.buffer);
     view.setUint32(4, total - 8, true);
     view.setUint32(16, payload.length, true);
     return out;
   }
   ```
   `createFallbackWebp` stitches a 20-byte pseudo-WebP header onto the first 128 bytes of the corrupt input and returns it as a valid WebP byte array.

5. **Exact Code Cause Observed in `apps/media-worker/src/services/image-processor.ts` (lines 31-35):**
   - In `processImageBuffer`:
     ```ts
     inputImage = PhotonImage.new_from_byteslice(buffer);
     const origW = inputImage.get_width();
     const origH = inputImage.get_height();
     const { w: targetW, h: targetH } = calculateTargetSize(origW, origH);
     const aspect_ratio = computeAspectRatio(targetW, targetH);
     ```
     There is no sanity check verifying `origW > 0` and `origH > 0`. In test `MP-09` (corrupt BMP), `origH` was `0`, producing `height_px: 0` and `aspect_ratio: 'wide'` (Infinity > 1.8), and storing an impossible 0-height image with status 200 OK.

---

## 2. Logic Chain

1. **Expectation vs Actual Reality (Obs 2):**
   - Requirement §R2 and Test Infra specify that the Media Worker must accept valid images (PNG, JPEG), convert them to WebP, extract dimensions, downscale oversized images, and **reject invalid/corrupted files** with HTTP 400/415/422 error JSON.
   - For completely unformatted bytes (e.g. text, PDF, random garbage), `getImageDimensions` throws and the route correctly returns HTTP 415 (`UNSUPPORTED_MEDIA_TYPE`).
   - HOWEVER, for corrupted files that begin with 2-8 valid magic bytes (e.g. `89 50 4E 47` for PNG, `GIF89a` for GIF, `BM` for BMP) followed by garbage, `getImageDimensions` reads offset dimensions from garbage bytes.
   - When Sharp tries to decode the image in `createWebpWithSharp`, Sharp throws a decode error (`Input buffer has corrupt header`).
   - But `convertToWebp` (Obs 3) catches this error and invokes `createFallbackWebp` (Obs 4), creating a dummy 148-byte WebP header around corrupt garbage and returning HTTP 200 OK with `success: true`.

2. **Security & Data Integrity Impact:**
   - Clients uploading broken/truncated images are told the upload succeeded (HTTP 200).
   - R2 is polluted with unrenderable, broken 148-byte `.webp` blobs.
   - Downstream Web UIs (`apps/web`) will load these URLs, resulting in broken image icons and frontend display errors.
   - Impossible dimensions such as `height_px: 0` (Obs 5) are accepted and returned in the API contract.

3. **Robustness of Other Areas (Obs 2):**
   - 25 of 29 tests PASSED with 100% precision:
     - Multipart valid PNG & raw blob valid JPEG uploads succeed and produce genuine WebP (`RIFF....WEBP`).
     - 0-byte uploads and missing fields are rejected with HTTP 400 (`INVALID_INPUT`).
     - Non-image files (plain text, PDF, random garbage) are rejected with HTTP 415.
     - Dimension and aspect ratio classification is mathematically accurate for 1x1, 1000x1 (`wide`), 1x1000 (`portrait`), 500x500 (`square`), 104x100 (`square`), 1600x1200 (`landscape`), 1920x800 (`wide`), 800x1200 (`portrait`).
     - Oversized downscaling works: 3000x2000 downscales to 2560x1707, 2000x3000 downscales to 1707x2560, and 3200x3200 downscales to 2560x2560.
     - WebP magic bytes `RIFF` and `WEBP` are verified on both the stored R2 object and the preview `/file/*` stream.

---

## 3. Caveats

- In production on Cloudflare Workers edge, `@cf-wasm/photon` will execute in WASM `workerd` environment rather than Node.js Sharp child process. However, the local worker bundle `apps/media-worker/dist/index.js` embeds this fallback logic, meaning local development and test simulations currently permit corrupt image uploads to pass as HTTP 200 OK.
- This review is strictly empirical and non-intrusive (no implementation code modified by Challenger).

---

## 4. Conclusion

**Verdict: `REQUEST_CHANGES`**

Worker M2 must implement the following 3 corrective actions:

1. **Fix `convertToWebp` Error Handling (`apps/media-worker/node_modules/@cf-wasm/photon/webp-converter.js`):**
   In the catch block of `convertToWebp`, if `createWebpWithSharp` threw an error due to image corruption (e.g. `err.message.includes("corrupt") || err.message.includes("unsupported") || err.message.includes("unable to parse")`), do NOT invoke `createFallbackWebp`. Rethrow the error or throw `new Error("Không hỗ trợ định dạng ảnh này hoặc dữ liệu bị hỏng")` so `upload.ts` catches it and returns HTTP 415/422. Only allow `createFallbackWebp` if Node/sharp is not supported in the execution environment.

2. **Add Dimension Sanity Check (`apps/media-worker/src/services/image-processor.ts`):**
   In `processImageBuffer`, immediately after reading `origW` and `origH`:
   ```ts
   if (!origW || !origH || origW <= 0 || origH <= 0 || !Number.isFinite(origW) || !Number.isFinite(origH)) {
     throw new Error("Không hỗ trợ định dạng ảnh này hoặc dữ liệu bị hỏng");
   }
   ```

3. **Re-bundle and Verify:**
   Re-run `wrangler deploy --dry-run --outdir=dist` in `apps/media-worker/` and run `node apps/media-worker/test-stress-ingestion.mjs` to confirm 29/29 tests pass.

---

## 5. Verification Method

To independently reproduce the failures and verify the fix:

1. **Run the Stress Test Suite:**
   ```powershell
   node apps/media-worker/test-stress-ingestion.mjs
   ```
   - **Current Output:** Fails with exit code 1 (25 passed, 4 failed).
   - **Invalidation Condition:** After Worker M2 applies the fixes, running this command must exit with code 0 and output:
     ```text
     TOTAL TESTS: 29 | PASSED: 29 | FAILED: 0
     >>> EMPIRICAL CHALLENGER VERDICT: APPROVE (100% tests passed) <<<
     ```

2. **Verify Line Counts:**
   ```powershell
   Get-ChildItem -Path "apps/media-worker/test-stress-*.mjs" | ForEach-Object { [PSCustomObject]@{ File = $_.Name; Lines = (Get-Content $_.FullName | Measure-Object -Line).Lines } }
   ```
   - Expected: All test files are strictly `< 100` lines.
