import { strict as assert } from "node:assert";
import worker from "./dist/index.js";
import { create11MbPayload, createMockR2, generateSampleImage } from "./test-fixtures.mjs";

const { bucket } = createMockR2();
const env = { MEDIA_BUCKET: bucket, NODE_ENV: "test", WEB_APP_URL: "https://khangviet.vn" };
let uploadedKey = "";

async function testHealth() {
  const res = await worker.request("/health", {}, env);
  assert.equal(res.status, 200, "Health status must be 200");
  const body = await res.json();
  assert.equal(body.status, "ok");
  assert.equal(body.service, "media-worker");
  console.log("✔ Test 1 passed: Health check GET /health");
}

async function testUploads() {
  const pngBytes = generateSampleImage(300, 100, "png");
  const form = new FormData();
  form.append("file", new Blob([pngBytes], { type: "image/png" }), "house.png");
  const res = await worker.request("/upload", { method: "POST", body: form }, env);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.equal(body.data.aspect_ratio, "wide");
  assert.equal(body.data.width_px, 300);
  assert.ok(body.data.r2_key.endsWith(".webp"));
  uploadedKey = body.data.r2_key;
  console.log("✔ Test 2 & 4 passed: Multipart upload & wide aspect ratio");

  const jpgBytes = generateSampleImage(100, 200, "jpeg");
  const rawRes = await worker.request("/upload", {
    method: "POST",
    headers: { "Content-Type": "image/jpeg" },
    body: jpgBytes,
  }, env);
  assert.equal(rawRes.status, 200);
  const rawBody = await rawRes.json();
  assert.equal(rawBody.data.aspect_ratio, "portrait");
  assert.equal(rawBody.data.height_px, 200);
  console.log("✔ Test 3 passed: Raw binary blob clipboard paste & portrait aspect ratio");
}

async function testLimitsAndSsrf() {
  const largeBytes = create11MbPayload();
  const resLarge = await worker.request("/upload", {
    method: "POST",
    headers: { "Content-Type": "image/jpeg" },
    body: largeBytes,
  }, env);
  assert.equal(resLarge.status, 413, "Must reject >10MB with HTTP 413");
  console.log("✔ Test 5 passed: 10MB payload size limit rejection");

  const ssrf1 = await worker.request("/fetch-external", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: "http://127.0.0.1:8787/api" }),
  }, env);
  assert.equal(ssrf1.status, 400, "Must block loopback 127.0.0.1");

  const ssrf2 = await worker.request("/fetch-external", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: "http://169.254.169.254/latest/meta-data/" }),
  }, env);
  assert.equal(ssrf2.status, 400, "Must block AWS/Cloud metadata IP");
  console.log("✔ Test 6 passed: SSRF defense on internal IPs & metadata");
}

async function testFileStream() {
  assert.ok(uploadedKey, "Must have uploaded key");
  const res = await worker.request(`/file/${uploadedKey}`, {}, env);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("Content-Type"), "image/webp");
  assert.ok(res.headers.get("Cache-Control").includes("immutable"));
  const bytes = new Uint8Array(await res.arrayBuffer());
  assert.ok(bytes.length > 0, "Preview stream must return non-empty bytes");
  console.log("✔ Test 7 passed: File stream preview route GET /file/*");
}

async function main() {
  console.log("=== BẮT ĐẦU E2E TEST MEDIA WORKER (7 TEST CASES) ===");
  await testHealth();
  await testUploads();
  await testLimitsAndSsrf();
  await testFileStream();
  console.log("=================================================");
  console.log(">>> TOÀN BỘ 7 TEST CASES ĐÃ VƯỢT QUA 100%! <<<");
  console.log("=================================================");
}

main().catch((err) => {
  console.error("Test suite failed:", err);
  process.exit(1);
});
