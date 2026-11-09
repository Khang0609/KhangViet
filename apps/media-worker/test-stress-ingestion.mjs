import worker from "./dist/index.js";
import { createMockR2 } from "./test-fixtures.mjs";
import { testMultipartSuite } from "./test-stress-assertions.mjs";
import { testDimensionSuite, testRawBlobSuite, testWebpMagicSuite } from "./test-stress-blobs.mjs";

const results = [];

function record(name, passed, detail = "") {
  results.push({ name, passed, detail });
  const icon = passed ? "✔" : "✖";
  console.log(`${icon} [${passed ? "PASS" : "FAIL"}] ${name} -> ${detail}`);
}

async function runAllStressTests() {
  console.log("==================================================================");
  console.log("=== EMPIRICAL STRESS TEST SUITE: MEDIA WORKER INGESTION & WEBP ===");
  console.log("==================================================================");

  const { bucket, store } = createMockR2();
  const env = { MEDIA_BUCKET: bucket, NODE_ENV: "test", WEB_APP_URL: "https://khangviet.vn" };

  console.log("\n--- [Suite 1: Multipart Form Uploads & Adversarial Buffers] ---");
  await testMultipartSuite(worker, env, record);

  console.log("\n--- [Suite 2: Raw Binary Blob Clipboard Paste (Ctrl+V)] ---");
  await testRawBlobSuite(worker, env, record);

  console.log("\n--- [Suite 3: Aspect Ratio & Boundary / Downscaling Tests] ---");
  await testDimensionSuite(worker, env, record);

  console.log("\n--- [Suite 4: WebP Magic Bytes RIFF/WEBP Verification] ---");
  await testWebpMagicSuite(worker, env, store, record);

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log("\n==================================================================");
  console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==================================================================");

  if (failed > 0) {
    console.error(`\n>>> EMPIRICAL CHALLENGER VERDICT: REQUEST_CHANGES (${failed} tests failed) <<<`);
    for (const f of results.filter((r) => !r.passed)) {
      console.error(`  - Failed: ${f.name} (${f.detail})`);
    }
    process.exit(1);
  } else {
    console.log("\n>>> EMPIRICAL CHALLENGER VERDICT: APPROVE (100% tests passed) <<<");
    process.exit(0);
  }
}

runAllStressTests().catch((err) => {
  console.error("Fatal test harness error:", err);
  process.exit(2);
});
