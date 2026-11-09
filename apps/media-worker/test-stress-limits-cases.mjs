import { strict as assert } from "node:assert";
import { createFailingBucket, createMockBucketWithData, generateSampleImage } from "./test-stress-helpers.mjs";

export async function runLimitsAndStorageTests(worker) {
  let passed = 0;
  let failed = 0;
  const bucket = createMockBucketWithData("projects/test.webp", {
    value: new Uint8Array([82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80]),
    options: { httpMetadata: { contentType: "image/webp", cacheControl: "public, max-age=31536000, immutable" } },
  });
  const env = { MEDIA_BUCKET: bucket, NODE_ENV: "test", WEB_APP_URL: "https://khangviet.vn" };

  console.log("\n--- SUITE 1: PAYLOAD SIZE LIMITS & BOUNDARY CONDITIONS ---");
  const sizeCases = [
    { label: "9.9MB Payload (accepted to processing)", size: Math.floor(9.9 * 1024 * 1024), expect413: false },
    { label: "10.0MB Exact Boundary (accepted to processing)", size: 10 * 1024 * 1024, expect413: false },
    { label: "10.0MB + 1 Byte (rejected with 413)", size: 10 * 1024 * 1024 + 1, expect413: true },
    { label: "10.1MB Payload (rejected with 413)", size: Math.floor(10.1 * 1024 * 1024), expect413: true },
    { label: "15.0MB Payload (rejected with 413)", size: 15 * 1024 * 1024, expect413: true },
  ];

  for (const tc of sizeCases) {
    const res = await worker.request("/upload", {
      method: "POST",
      headers: { "Content-Type": "image/jpeg" },
      body: Buffer.alloc(tc.size, 0x41),
    }, env);
    const is413 = res.status === 413;
    if (is413 === tc.expect413) {
      console.log(`  ✔ [PASS] ${tc.label} (status: ${res.status})`);
      passed++;
    } else {
      console.log(`  ✖ [FAIL] ${tc.label} (expected 413: ${tc.expect413}, got: ${res.status})`);
      failed++;
    }
  }

  // Test empty payload
  const emptyRes = await worker.request("/upload", { method: "POST", body: "" }, env);
  if (emptyRes.status === 400) {
    console.log("  ✔ [PASS] Empty payload upload rejected with HTTP 400 (INVALID_INPUT)");
    passed++;
  } else {
    console.log(`  ✖ [FAIL] Empty payload upload expected 400, got: ${emptyRes.status}`);
    failed++;
  }

  console.log("\n--- SUITE 2: FILE STREAM PREVIEW & PATH TRAVERSAL DEFENSE ---");
  const fileCases = [
    { label: "Normal file retrieval", path: "/file/projects/test.webp", expectStatus: 200 },
    { label: "Missing file key", path: "/file/projects/non-existent.webp", expectStatus: 404 },
    { label: "Empty key /file/", path: "/file/", expectStatus: 400 },
    { label: "Path traversal /file/../../secret", path: "/file/../../secret", expectStatus: 404 },
    { label: "URL-encoded traversal /file/%2e%2e%2fsecret", path: "/file/%2e%2e%2fsecret", expectStatus: 404 },
  ];
  for (const fc of fileCases) {
    const res = await worker.request(fc.path, {}, env);
    if (res.status === fc.expectStatus) {
      console.log(`  ✔ [PASS] ${fc.label} (status: ${res.status})`);
      passed++;
    } else {
      console.log(`  ✖ [FAIL] ${fc.label} (expected: ${fc.expectStatus}, got: ${res.status})`);
      failed++;
    }
  }

  console.log("\n--- SUITE 3: R2 STORAGE RESILIENCE & FAILURE RECOVERY ---");
  const failingEnv = { MEDIA_BUCKET: createFailingBucket(), NODE_ENV: "test" };
  const pngBytes = generateSampleImage(100, 100, "png");
  const uploadFailRes = await worker.request("/upload", {
    method: "POST",
    headers: { "Content-Type": "image/png" },
    body: pngBytes,
  }, failingEnv);
  const uploadFailBody = await uploadFailRes.json();
  if (uploadFailRes.status === 422 && uploadFailBody.error?.code === "PROCESSING_ERROR") {
    console.log("  ✔ [PASS] R2 put failure handled cleanly with HTTP 422 PROCESSING_ERROR");
    passed++;
  } else {
    console.log(`  ✖ [FAIL] R2 put failure expected 422 PROCESSING_ERROR, got: ${uploadFailRes.status}`);
    failed++;
  }

  const getFailRes = await worker.request("/file/projects/sample.webp", {}, failingEnv);
  const getFailBody = await getFailRes.json();
  if (getFailRes.status === 500 && getFailBody.error?.code === "INTERNAL_ERROR") {
    console.log("  ✔ [PASS] R2 get failure caught by errorHandler with HTTP 500 INTERNAL_ERROR");
    passed++;
  } else {
    console.log(`  ✖ [FAIL] R2 get failure expected 500 INTERNAL_ERROR, got: ${getFailRes.status}`);
    failed++;
  }

  return { passed, failed };
}
