import { strict as assert } from "node:assert";
import worker from "../../../apps/media-worker/dist/index.js";
import { createMockR2, generateSampleImage, create11MbPayload } from "../../../apps/media-worker/test-fixtures.mjs";

console.log("=== FORENSIC AUDITOR INDEPENDENT VERIFICATION & STRESS-TEST ===");

async function runForensicSuite() {
  const { bucket, store } = createMockR2();
  const env = {
    MEDIA_BUCKET: bucket,
    NODE_ENV: "production",
    PUBLIC_R2_URL: "https://media.khangviet.vn",
    WEB_APP_URL: "https://khangviet.vn"
  };

  // 1. Check Magic Bytes of WebP output
  console.log("\n[CHECK 1] WebP Magic Bytes Verification");
  const pngBytes = generateSampleImage(120, 80, "png");
  const form = new FormData();
  form.append("file", new Blob([pngBytes], { type: "image/png" }), "test.png");
  
  const uploadRes = await worker.request("/upload", { method: "POST", body: form }, env);
  assert.equal(uploadRes.status, 200, "Upload should return 200");
  const uploadJson = await uploadRes.json();
  assert.equal(uploadJson.success, true);
  
  const r2Key = uploadJson.data.r2_key;
  const storedItem = store.get(r2Key);
  assert.ok(storedItem, "Item must be stored in R2 bucket");
  const storedBytes = storedItem.value;

  // RIFF header
  const riff = Buffer.from(storedBytes.slice(0, 4)).toString("ascii");
  assert.equal(riff, "RIFF", "WebP header bytes 0..3 must be RIFF");
  // WEBP format
  const webp = Buffer.from(storedBytes.slice(8, 12)).toString("ascii");
  assert.equal(webp, "WEBP", "WebP header bytes 8..11 must be WEBP");
  console.log(`  PASSED: Magic bytes verified: '${riff}....${webp}' (${storedBytes.length} bytes)`);

  // 2. Large Image Downscaling (Oversized 3000x1500 -> capped at 2560x1280)
  console.log("\n[CHECK 2] Image Downscaling & Lanczos3 Resize Verification");
  const largeImgBytes = generateSampleImage(3000, 1500, "png");
  const rawRes = await worker.request("/upload", {
    method: "POST",
    headers: { "Content-Type": "image/png" },
    body: largeImgBytes,
  }, env);
  assert.equal(rawRes.status, 200);
  const rawJson = await rawRes.json();
  assert.equal(rawJson.data.width_px, 2560, "Width should be capped at 2560");
  assert.equal(rawJson.data.height_px, 1280, "Height should be proportionally scaled to 1280");
  assert.equal(rawJson.data.aspect_ratio, "wide", "3000/1500 = 2.0 -> wide");
  console.log(`  PASSED: Scaled from 3000x1500 to ${rawJson.data.width_px}x${rawJson.data.height_px} (ratio: ${rawJson.data.aspect_ratio})`);

  // 3. Repeated conversions to verify no WASM memory leak / panic
  console.log("\n[CHECK 3] Repeated WASM Execution & Memory Stress (20 iterations)");
  for (let i = 0; i < 20; i++) {
    const sample = generateSampleImage(100 + i * 10, 80 + i * 5, "png");
    const r = await worker.request("/upload", {
      method: "POST",
      headers: { "Content-Type": "image/png" },
      body: sample,
    }, env);
    assert.equal(r.status, 200);
  }
  console.log("  PASSED: 20 sequential WASM conversions succeeded without memory panic");

  // 4. Corrupted / Fake Image Rejection
  console.log("\n[CHECK 4] Corrupted & Non-image Payload Handling");
  const fakeData = Buffer.from("<html><body>Not an image</body></html>");
  const fakeRes = await worker.request("/upload", {
    method: "POST",
    headers: { "Content-Type": "image/png" },
    body: fakeData,
  }, env);
  assert.ok(fakeRes.status === 415 || fakeRes.status === 422, `Fake image should be rejected with 415/422, got ${fakeRes.status}`);
  const fakeJson = await fakeRes.json();
  assert.equal(fakeJson.success, false);
  console.log(`  PASSED: Corrupted image rejected with HTTP ${fakeRes.status} (${fakeJson.error?.code})`);

  // 5. SSRF Boundary Attacks
  console.log("\n[CHECK 5] SSRF Defense Matrix Testing");
  const ssrfPayloads = [
    { url: "http://127.0.0.1:8787/secret", expected: 400 },
    { url: "http://localhost:3000/admin", expected: 400 },
    { url: "http://10.0.0.1/internal", expected: 400 },
    { url: "http://172.16.5.10/api", expected: 400 },
    { url: "http://192.168.1.1/router", expected: 400 },
    { url: "http://169.254.169.254/metadata", expected: 400 },
    { url: "http://0.0.0.0/test", expected: 400 },
    { url: "http://2130706433/", expected: 400 }, // Integer 127.0.0.1
    { url: "ftp://example.com/image.png", expected: 400 }, // Disallowed protocol
    { url: "javascript:alert(1)", expected: 400 },
  ];

  for (const { url, expected } of ssrfPayloads) {
    const res = await worker.request("/fetch-external", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    }, env);
    assert.equal(res.status, expected, `SSRF URL ${url} must be rejected with ${expected}, got ${res.status}`);
  }
  console.log("  PASSED: All 10 SSRF attack vectors successfully blocked");

  // 6. Security Headers (nosniff, DENY)
  console.log("\n[CHECK 6] Security Headers Verification");
  const healthRes = await worker.request("/health", {}, env);
  assert.equal(healthRes.headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(healthRes.headers.get("X-Frame-Options"), "DENY");
  console.log("  PASSED: nosniff and X-Frame-Options: DENY headers verified");

  // 7. CORS Configuration
  console.log("\n[CHECK 7] CORS Verification");
  const corsPreflight = await worker.request("/upload", {
    method: "OPTIONS",
    headers: { "Origin": "http://localhost:3000" }
  }, env);
  assert.equal(corsPreflight.status, 204);
  assert.equal(corsPreflight.headers.get("Access-Control-Allow-Origin"), "http://localhost:3000");
  console.log("  PASSED: CORS preflight & origin reflection verified");

  console.log("\n=======================================================");
  console.log(">>> ALL FORENSIC CHECKS & STRESS TESTS PASSED 100%! <<<");
  console.log("=======================================================");
}

runForensicSuite().catch((err) => {
  console.error("❌ FORENSIC TEST SUITE FAILED:", err);
  process.exit(1);
});
