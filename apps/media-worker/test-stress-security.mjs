import worker from "./dist/index.js";
import { runLimitsAndStorageTests } from "./test-stress-limits-cases.mjs";
import { runSsrfStressTests } from "./test-stress-ssrf-cases.mjs";

async function main() {
  console.log("===============================================================");
  console.log("   KHANG VIET MEDIA WORKER — ADVERSARIAL STRESS TEST SUITE   ");
  console.log("===============================================================");

  const t0 = Date.now();
  const limitsRes = await runLimitsAndStorageTests(worker);
  const ssrfRes = await runSsrfStressTests(worker);

  const totalPassed = limitsRes.passed + ssrfRes.passed;
  const totalFailed = limitsRes.failed + ssrfRes.failed;
  const totalTests = totalPassed + totalFailed;
  const elapsedMs = Date.now() - t0;

  console.log("\n===============================================================");
  console.log("                     STRESS TEST SUMMARY                      ");
  console.log("===============================================================");
  console.log(` Total Scenarios Tested: ${totalTests}`);
  console.log(` Passed:                 ${totalPassed} (${((totalPassed / totalTests) * 100).toFixed(1)}%)`);
  console.log(` Failed:                 ${totalFailed} (${((totalFailed / totalTests) * 100).toFixed(1)}%)`);
  console.log(` Execution Time:         ${elapsedMs}ms`);
  console.log("===============================================================");

  if (totalFailed > 0) {
    console.log(`\n>>> VERDICT: REQUEST_CHANGES (${totalFailed} failure(s) detected) <<<`);
    process.exit(1);
  } else {
    console.log("\n>>> VERDICT: APPROVE (All security stress tests passed) <<<");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Fatal Test Suite Crash:", err);
  process.exit(2);
});
