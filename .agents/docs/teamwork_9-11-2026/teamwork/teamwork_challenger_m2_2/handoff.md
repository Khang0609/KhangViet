# Handoff Report: Milestone 2 Adversarial Stress & Security Testing (`apps/media-worker`)

**Agent:** Challenger 2 — Security & Robustness Empirical Challenger  
**Recipient:** Orchestrator (`9875b955-8c1f-4348-971a-46ec427f4059`) / Worker M2  
**Milestone:** Milestone 2 (`apps/media-worker`)  
**Verdict:** **REQUEST_CHANGES**  
**Date:** 2026-11-08  

---

## 1. Observation

Empirical testing was executed against `apps/media-worker/dist/index.js` using the automated adversarial test harness `node apps/media-worker/test-stress-security.mjs` (comprising `test-stress-security.mjs`, `test-stress-ssrf-cases.mjs`, `test-stress-limits-cases.mjs`, and `test-stress-helpers.mjs`).

### A. Test Execution Summary
- **Total Test Cases Run**: 35
- **Passed**: 29 (82.9%)
- **Failed**: 6 (17.1%)

```text
===============================================================
                     STRESS TEST SUMMARY                      
===============================================================
 Total Scenarios Tested: 35
 Passed:                 29 (82.9%)
 Failed:                 6 (17.1%)
 Execution Time:         10435ms
===============================================================
>>> VERDICT: REQUEST_CHANGES (6 failure(s) detected) <<<
```

### B. Detailed Suite Results & Direct Quotes

#### Suite 1: Payload Size Limits & Boundary Conditions (6 Scenarios — 6 Passed)
- `9.9MB Payload` (10,380,902 bytes): Passed boundary check, entered processing pipeline (HTTP 415 due to dummy test bytes, not rejected with 413) — **PASS**
- `10.0MB Exact Boundary` (10,485,760 bytes): Passed boundary check, entered processing pipeline (HTTP 415, not 413) — **PASS**
- `10.0MB + 1 Byte` (10,485,761 bytes): Rejected with HTTP 413 `FILE_TOO_LARGE` — **PASS**
- `10.1MB Payload` (10,590,617 bytes): Rejected with HTTP 413 `FILE_TOO_LARGE` — **PASS**
- `15.0MB Payload` (15,728,640 bytes): Rejected with HTTP 413 `FILE_TOO_LARGE` — **PASS**
- `Empty Payload` (0 bytes): Rejected with HTTP 400 `INVALID_INPUT` (`"Không tìm thấy dữ liệu tệp tải lên"`) — **PASS**

#### Suite 2: File Stream Preview & Path Traversal Defense (5 Scenarios — 5 Passed)
- `Normal file retrieval` (`GET /file/projects/test.webp`): HTTP 200, Content-Type: `image/webp`, Cache-Control: `public, max-age=31536000, immutable` — **PASS**
- `Missing file key` (`GET /file/projects/non-existent.webp`): HTTP 404, `{"code": "NOT_FOUND", "message": "Không tìm thấy tệp trong bộ lưu trữ"}` — **PASS**
- `Empty key` (`GET /file/`): HTTP 400, `{"code": "INVALID_KEY", "message": "Đường dẫn tệp không hợp lệ"}` — **PASS**
- `Path traversal attempt` (`GET /file/../../secret`): Resolved to `/secret` by WHATWG URL normalization, caught by Hono global `notFound` returning HTTP 404 — **PASS**
- `URL-encoded traversal` (`GET /file/%2e%2e%2fsecret`): Key extracted as flat string `"..%2fsecret"` in R2 object storage, returns HTTP 404 `NOT_FOUND` without filesystem leak — **PASS**

#### Suite 3: R2 Storage Resilience & Failure Recovery (2 Scenarios — 2 Passed)
- `R2 put failure` (`POST /upload` when R2 throws `R2_STORAGE_QUOTA_EXCEEDED`): Handled cleanly, returns HTTP 422 `{"code": "PROCESSING_ERROR", "message": "R2_STORAGE_QUOTA_EXCEEDED"}` without unhandled worker crash — **PASS**
- `R2 get failure` (`GET /file/*` when R2 throws `R2_SERVICE_UNAVAILABLE`): Caught by `app.onError` in `apps/media-worker/src/index.ts`, returns HTTP 500 `{"code": "INTERNAL_ERROR", "message": "R2_SERVICE_UNAVAILABLE"}` — **PASS**

#### Suite 4: SSRF Defense Vectors against `POST /fetch-external` (19 Scenarios — 13 Passed, 6 Failed)
- Blocked standard vectors (HTTP 400 `SSRF_BLOCKED`):
  - `http://127.0.0.1/evil.png` — **PASS**
  - `http://localhost:8080/image.jpg` — **PASS**
  - `http://10.0.0.1/pic.png` — **PASS**
  - `http://172.16.0.5/pic.png` — **PASS**
  - `http://192.168.1.1/pic.png` — **PASS**
  - `http://169.254.169.254/latest/meta-data/` — **PASS**
  - `http://[::1]/image.png` — **PASS**
  - `javascript:alert(1)` — **PASS**
  - `file:///etc/passwd` — **PASS**
  - `ftp://example.com/test.png` — **PASS**
  - `http://2130706433/image.png` (Decimal integer IP) — **PASS**
  - `http://0177.0.0.1/test.png` (Octal IP) — **PASS**
  - `http://0x7f.0.0.1/test.png` (Hexadecimal IP) — **PASS**

- **VERBATIM FAILURES (Bypassed SSRF perimeter, proceeded to outbound fetch):**
  1. `http://[::]/image.png` (IPv6 Unspecified address):
     - Expected: HTTP 400 `SSRF_BLOCKED`
     - Actual: HTTP 502 `{"code":"FETCH_FAILED","message":"fetch failed"}`
  2. `http://[fe80::1]/image.png` (IPv6 Link-Local address):
     - Expected: HTTP 400 `SSRF_BLOCKED`
     - Actual: HTTP 502 `{"code":"FETCH_FAILED","message":"This operation was aborted"}`
  3. `http://[fc00::1]/image.png` (IPv6 Unique Local fc00):
     - Expected: HTTP 400 `SSRF_BLOCKED`
     - Actual: HTTP 502 `{"code":"FETCH_FAILED","message":"fetch failed"}`
  4. `http://[fd00::1]/image.png` (IPv6 Unique Local fd00):
     - Expected: HTTP 400 `SSRF_BLOCKED`
     - Actual: HTTP 502 `{"code":"FETCH_FAILED","message":"fetch failed"}`
  5. `http://[::ffff:127.0.0.1]/image.png` (IPv4-mapped IPv6 loopback):
     - Expected: HTTP 400 `SSRF_BLOCKED`
     - Actual: HTTP 502 `{"code":"FETCH_FAILED","message":"fetch failed"}`
  6. `http://[::ffff:169.254.169.254]/image.png` (IPv4-mapped IPv6 metadata):
     - Expected: HTTP 400 `SSRF_BLOCKED`
     - Actual: HTTP 502 `{"code":"FETCH_FAILED","message":"fetch failed"}`

#### Suite 5: Malformed Inputs to `POST /fetch-external` (3 Scenarios — 3 Passed)
- `{}` (missing url): HTTP 400 `INVALID_INPUT` — **PASS**
- `{"url": ""}` (empty string): HTTP 400 `INVALID_INPUT` — **PASS**
- `{"url": 12345}` (non-string): HTTP 400 `INVALID_INPUT` — **PASS**

---

## 2. Logic Chain

1. **Root Cause Analysis in `apps/media-worker/src/services/ssrf-validator.ts` (lines 19-29):**
   ```ts
   function isPrivateHost(hostname: string): boolean {
     const host = hostname.toLowerCase().trim();
     if (host === "localhost" || host === "::1" || host === "[::1]") return true;
     if (host.startsWith("fe80:") || host.startsWith("fc00:") || host.startsWith("fd00:")) return true;
     if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host)) {
       return isPrivateIpv4(host);
     }
     if (/^\d+$/.test(host)) return true;
     return false;
   }
   ```
2. In the WHATWG URL specification (implemented in standard Node.js & Cloudflare Workers runtimes):
   - `new URL("http://[fe80::1]/image.png").hostname` preserves the surrounding brackets and evaluates to `"[fe80::1]"`.
   - Therefore, `host.startsWith("fe80:")`, `host.startsWith("fc00:")`, and `host.startsWith("fd00:")` all evaluate to `false` because the first character is `"["`.
3. Furthermore:
   - The IPv6 unspecified address `[::]` is not evaluated by `host === "[::1]"`.
   - IPv4-mapped IPv6 addresses (e.g. `[::ffff:127.0.0.1]`, normalized by WHATWG to `"[::ffff:7f00:1]"`, or `[::ffff:169.254.169.254]`) bypass both the regex `/^(\d{1,3}\.){3}\d{1,3}$/` and the integer check `/^\d+$/`.
4. As demonstrated by Obs 1.B (Suite 4, failures 1–6):
   - `validateSsrfUrl()` returned `{ safe: true }` for all 6 vectors.
   - `fetchExternalRoute` immediately proceeded to `downloadExternalImage()` and triggered an outbound `fetch(targetUrl)` against the internal IPv6 / link-local / loopback interface.
   - The response returned HTTP 502 (`FETCH_FAILED`) instead of being blocked at the boundary with HTTP 400 (`SSRF_BLOCKED`).
5. In a production environment or Cloudflare Worker deployment, allowing requests to slip past `validateSsrfUrl` permits internal port scanning and unauthorized intranet access against IPv6 and IPv4-mapped endpoints.
6. Therefore, the security boundary fails to meet the strict SSRF defense requirements defined in `PROJECT.md` and `DISPATCH.md`.

---

## 3. Caveats

- In the local testing harness, `fetch()` attempts to internal IPv6 addresses timed out or refused connection with HTTP 502 because there was no server listening on those ports in the local test sandbox. However, the critical vulnerability is that `validateSsrfUrl` permitted the request to proceed to `fetch()`.
- DNS rebinding attacks using external domains that dynamically resolve to internal IP addresses cannot be prevented without runtime IP pinning; Cloudflare Workers do not expose raw DNS A/AAAA record queries prior to `fetch()`, so host-level URL validation is the expected platform pattern.

---

## 4. Conclusion

- **Verdict:** **REQUEST_CHANGES**
- **Justification:**
  - Milestone 2 satisfies 10MB payload size limits, path traversal defenses, and R2 exception resilience.
  - However, `apps/media-worker/src/services/ssrf-validator.ts` contains a reproducible SSRF perimeter bypass for IPv6 bracketed hostnames (`[fe80::1]`, `[fc00::1]`, `[fd00::1]`, `[::]`) and IPv4-mapped IPv6 addresses (`[::ffff:...]`).
- **Required Remediation for Worker M2:**
  In `apps/media-worker/src/services/ssrf-validator.ts`:
  1. Strip enclosing brackets: `const cleanHost = host.replace(/^\[|\]$/g, "");`
  2. Check for IPv6 unspecified and loopbacks: `cleanHost === "localhost" || cleanHost === "::1" || cleanHost === "::" || cleanHost === "0.0.0.0"`
  3. Check IPv6 prefixes: `cleanHost.startsWith("fe80:") || cleanHost.startsWith("fc") || cleanHost.startsWith("fd")`
  4. Block or sanitize IPv4-mapped IPv6: `cleanHost.startsWith("::ffff:")`
  5. Re-run `node apps/media-worker/test-stress-security.mjs` and verify all 35 tests pass (100%).

---

## 5. Verification Method

To reproduce the findings independently:

1. **Run the Adversarial Stress Test Suite:**
   ```bash
   node apps/media-worker/test-stress-security.mjs
   ```
   *Observed Result:* Exits with code 1. 29 tests pass, 6 SSRF vectors fail with `SSRF BYPASS` (status 502 instead of 400).

2. **Verify Line Counts of Stress Test Assets (Code Organization Compliance):**
   ```powershell
   Get-ChildItem -Path "apps/media-worker" -File | Where-Object { $_.Name -like "test-stress-*" } | ForEach-Object { [PSCustomObject]@{ File = $_.Name; Lines = (Get-Content $_.FullName | Measure-Object -Line).Lines } }
   ```
   *Result:* All 4 files (`test-stress-security.mjs`, `test-stress-ssrf-cases.mjs`, `test-stress-limits-cases.mjs`, `test-stress-helpers.mjs`) are strictly <= 87 lines.
