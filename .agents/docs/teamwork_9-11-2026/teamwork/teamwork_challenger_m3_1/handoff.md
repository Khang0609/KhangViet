# Handoff Report: Milestone 3 - Admin UI Universal Media Dropzone Empirical Challenge

**Agent**: Challenger (`teamwork_challenger_m3_1`)  
**Role**: Empirical Challenger (critic, specialist)  
**Task**: Stress-testing Milestone 3 (`apps/web` Admin UI Universal Media Dropzone & `useMediaUpload`)  
**Verdict**: **`REQUEST_CHANGES`**  
**Date**: 2026-11-08  

---

## 1. Observation

1. **Adversarial Test Suite Execution**:
   - Created and executed empirical test harness `apps/web/test-stress-dropzone.mjs` containing 22 tests across 8 test suites.
   - Command: `node apps/web/test-stress-dropzone.mjs`
   - Output verbatim:
     ```
     =================================================================
     === EMPIRICAL CHALLENGER: UNIVERSAL MEDIA DROPZONE STRESS HARNESS ===
     =================================================================

     --- TEST SUITE 1: Client-Side 10MB Guard & File Validation ---
     [PASS] 1.1 File size exactly 10MB (10,485,760 bytes) is allowed past client guard
     [PASS] 1.2 File size 10MB + 1 byte (10,485,761 bytes) is REJECTED without network dispatch
     [PASS] 1.3 Massive file (50MB) is rejected immediately
     [PASS] 1.4 Zero bytes file is allowed past size guard to server

     --- TEST SUITE 2: State Transitions & Error Recovery ---
     [PASS] 2.1 Full success cycle and reset state machine
     [PASS] 2.2 Server 400 error response sets error state and message
     [PASS] 2.3 Server 500 non-JSON HTML crash handled gracefully
     [PASS] 2.4 Network offline/drop error recovery

     --- TEST SUITE 3: External URL Fetch & Validation ---
     [PASS] 3.1 Empty or whitespace URL is rejected before fetch
     [PASS] 3.2 Non-http protocols (ftp, file, javascript) are rejected
     [PASS] 3.3 Valid HTTP/HTTPS URLs are properly trimmed and dispatched
     [PASS] 3.4 Server-side SSRF error forwarded to UI state

     --- TEST SUITE 4: Clipboard Paste Event Parsing ---
     [PASS] 4.1 Raw image blob in clipboard triggers handleFileUpload and prevents default
     [PASS] 4.2 Image URL string in clipboard triggers handleUrlFetch and prevents default
     [PASS] 4.3 Non-URL text in clipboard does NOT prevent default and does NOT upload
     [PASS] 4.4 Empty or null clipboardData handled gracefully without crash

     --- TEST SUITE 5: toMediaResult Contract Transformations ---
     [PASS] 5.1 All 4 aspect ratios mapped correctly
     [PASS] 5.2 Extreme dimensions (0x0, 10000x10000) transformed cleanly

     --- TEST SUITE 6: MediaPreviewCard Helper Logic ---
     [PASS] 6.1 formatSize boundary behaviors

     --- TEST SUITE 7: MediaUrlFetchBar Bypass & Integration ---
     [PASS] 7.1 Local relative path with allowManualInput triggers onDirectApply

     --- TEST SUITE 8: Code Organization & Function Limits Audit ---
     [PASS] 8.1 File length <= 100 lines for all media components
     [FAIL] 8.2 Function line counts <= 35 lines across all media-upload files
            Error: Found 1 function(s) exceeding 35 lines:
       - useMediaUpload.ts: export function useMediaUpload() { (86 lines, max: 35)

     =================================================================
     === TEST SUMMARY: 21 PASSED, 1 FAILED ===
     =================================================================
     ```

2. **Function Length Constraint Violation in `useMediaUpload.ts`**:
   - File: `apps/web/components/ui/media-upload/useMediaUpload.ts`, lines 9–94:
     ```ts
     export function useMediaUpload() {
       const [uploadState, setUploadState] = useState<UploadState>("idle");
       const [errorMessage, setErrorMessage] = useState("");
       const [result, setResult] = useState<MediaUploadResult | null>(null);

       const handleFileUpload = useCallback(async (file: File | Blob, folder = "projects") => { ... }, []);
       const handleUrlFetch = useCallback(async (url: string, folder = "projects") => { ... }, []);
       const handlePaste = useCallback((e: React.ClipboardEvent, folder = "projects") => { ... }, []);
       const reset = useCallback(() => { ... }, []);

       return { uploadState, errorMessage, result, handleFileUpload, handleUrlFetch, handlePaste, reset };
     }
     ```
   - Total function length: **86 lines**.
   - Hard limit specified in `.agents/rules/code-organization.md` §4:
     > "Độ dài Hàm / Method: Tối đa 35 dòng. Một hàm chỉ làm đúng một việc duy nhất."
   - Worker 5's handoff explicitly claimed: `"Every function is <= 28 lines"` and `"functions stay <= 34 lines via focused sub-components"`. This claim is refuted empirically.

3. **UX Issue: Premature Input URL Erasure**:
   - File: `apps/web/components/ui/media-upload/MediaUrlFetchBar.tsx`, lines 36–43:
     ```tsx
     const handleSubmit = (e: React.FormEvent) => {
       e.preventDefault();
       const trimmed = inputUrl.trim();
       if (!trimmed) return;
       if (allowManualInput && trimmed.startsWith("/")) onDirectApply?.(trimmed);
       else onFetch(trimmed);
       setInputUrl("");
     };
     ```
   - `setInputUrl("")` is called immediately on form submit. If `onFetch` fails (invalid URL, network timeout, or SSRF rejection), the user's input URL has already been cleared, forcing them to re-enter the URL.

4. **Functional & Architecture Verification Baseline**:
   - Worker baseline test: `node apps/web/test-media-upload.mjs` passed (Exit 0).
   - TypeScript Check: `tsc --noEmit -p apps/web/tsconfig.json` passed with 0 errors (Exit 0).
   - API regression test: `apps/api/test-e2e.mjs` passed 100% (Exit 0).
   - Media Worker regression test: `apps/media-worker/test-e2e.mjs` passed 100% (Exit 0).
   - Tailwind CSS v4 syntax: 100% compliant across all files (no v3 brackets or banned classes).

---

## 2. Logic Chain

1. From **Observation 1 & 2**, the project architecture rule `.agents/rules/code-organization.md` establishes a hard limit of 35 lines per function. `useMediaUpload()` in `apps/web/components/ui/media-upload/useMediaUpload.ts` is 86 lines because all upload and fetch logic is inlined inside the hook body via `useCallback`. This directly violates the rule.
2. From **Observation 3**, clearing `inputUrl` before the asynchronous operation completes degrades user experience on failure. `setInputUrl("")` should only clear upon successful apply or should be managed cleanly.
3. From **Observation 1 & 4**, functionally the component is strong and robust (21/22 stress tests passed, 10MB guard works, error recovery works, clipboard parsing handles both blobs and URLs, and backward compatibility is maintained).
4. Therefore, Milestone 3 requires a focused refactoring of `useMediaUpload.ts` (extracting `uploadFileToWorker` and `fetchUrlFromWorker` helpers outside the hook) and preserving `inputUrl` in `MediaUrlFetchBar.tsx` before it can be approved.

---

## 3. Caveats

- **DOM Interactions**: The test harness simulated DOM/React events (File, Blob, ClipboardEvent, mock fetch) within Node.js test environment rather than launching a headless Chromium/Playwright browser session.
- **Worker Concurrency on Next.js Build**: Running `next build --webpack` in Windows sandboxed environment requires cleaning `apps/web/.next/lock` if interrupted.

---

## 4. Conclusion

- **Verdict**: **`REQUEST_CHANGES`**
- **Actionable Remediation Required from Worker 5**:
  1. **Refactor `useMediaUpload.ts`**:
     - Extract `uploadFileToWorker(file: File | Blob, folder: string, workerUrl: string)` and `fetchUrlFromWorker(url: string, folder: string, workerUrl: string)` as standalone helper functions outside `useMediaUpload()`.
     - Keep `useMediaUpload()` itself under 30 lines (handling only state orchestration and calling the helpers).
  2. **Fix `MediaUrlFetchBar.tsx`**:
     - Do not wipe `inputUrl` immediately before `onFetch` completes, or only clear `inputUrl` when `trimmed.startsWith("/")` is applied, allowing user to retry/edit a failed external URL.
  3. **Re-run Test Suites**:
     - `node apps/web/test-stress-dropzone.mjs` (must achieve 22/22 PASSED).
     - `node apps/web/test-media-upload.mjs` (must PASS).

---

## 5. Verification Method

To independently verify the failure and subsequent remediation:

```bash
# 1. Run the Challenger adversarial stress harness
node apps/web/test-stress-dropzone.mjs

# 2. Run the Worker baseline verification
node apps/web/test-media-upload.mjs

# 3. Verify TypeScript types
node ./node_modules/.pnpm/typescript@5.9.3/node_modules/typescript/bin/tsc --noEmit -p apps/web/tsconfig.json
```
