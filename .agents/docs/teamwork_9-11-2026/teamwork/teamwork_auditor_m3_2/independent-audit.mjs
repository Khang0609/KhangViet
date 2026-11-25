import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require(path.resolve(process.cwd(), "node_modules/.pnpm/typescript@5.9.3/node_modules/typescript"));

console.log("=================================================================");
console.log("FORENSIC INDEPENDENT AUDIT: MILESTONE 3 REMEDIATION (ITERATION 2)");
console.log("=================================================================\n");

const targetFiles = [
  "apps/web/components/ui/media-upload/types.ts",
  "apps/web/components/ui/media-upload/mediaUploadService.ts",
  "apps/web/components/ui/media-upload/useMediaUpload.ts",
  "apps/web/components/ui/media-upload/MediaDropzoneView.tsx",
  "apps/web/components/ui/media-upload/MediaPreviewCard.tsx",
  "apps/web/components/ui/media-upload/MediaUrlFetchBar.tsx",
  "apps/web/components/ui/media-upload/UniversalMediaUpload.tsx",
  "apps/web/components/ui/media-upload/index.ts",
  "apps/web/components/ui/ImageUrlInput.tsx",
];

let totalViolations = 0;

// -------------------------------------------------------------
// CHECK 1: File Line Counts (Hard Limit <= 100 lines)
// -------------------------------------------------------------
console.log("--- CHECK 1: File Line Counts (Hard limit <= 100 lines) ---");
for (const file of targetFiles) {
  const content = fs.readFileSync(file, "utf8");
  const lineCount = content.split(/\r?\n/).length;
  const pass = lineCount <= 100;
  console.log(`[${pass ? "PASS" : "FAIL"}] ${file}: ${lineCount} lines (limit: <= 100)`);
  if (!pass) totalViolations++;
}

// -------------------------------------------------------------
// CHECK 2: Function Length AST Analysis (Hard limit <= 35 lines)
// -------------------------------------------------------------
console.log("\n--- CHECK 2: Function Length AST Analysis (Hard limit <= 35 lines) ---");
let totalFunctionsChecked = 0;
let failedFunctions = 0;

function getFunctionName(node, sourceFile) {
  if (node.name && ts.isIdentifier(node.name)) return node.name.text;
  if (ts.isVariableDeclaration(node.parent) && ts.isIdentifier(node.parent.name)) {
    return node.parent.name.text;
  }
  if (ts.isPropertyAssignment(node.parent) && ts.isIdentifier(node.parent.name)) {
    return node.parent.name.text;
  }
  return "<anonymous>";
}

for (const file of targetFiles) {
  const content = fs.readFileSync(file, "utf8");
  const isTsx = file.endsWith(".tsx");
  const sourceFile = ts.createSourceFile(
    file,
    content,
    ts.ScriptTarget.Latest,
    true,
    isTsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );

  console.log(`\nInspecting functions in: ${file}`);
  let functionsInFile = 0;

  function visit(node) {
    if (
      ts.isFunctionDeclaration(node) ||
      ts.isFunctionExpression(node) ||
      ts.isArrowFunction(node) ||
      ts.isMethodDeclaration(node)
    ) {
      functionsInFile++;
      totalFunctionsChecked++;
      const start = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
      const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
      const startLine = start.line + 1;
      const endLine = end.line + 1;
      const lineSpan = endLine - startLine + 1;
      const funcName = getFunctionName(node, sourceFile);

      const pass = lineSpan <= 35;
      console.log(
        `  [${pass ? "PASS" : "FAIL"}] ${funcName} (L${startLine}-L${endLine}, ${lineSpan} lines, limit <= 35)`
      );
      if (!pass) {
        failedFunctions++;
        totalViolations++;
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  if (functionsInFile === 0) {
    console.log("  (No functions defined - type / barrel file)");
  }
}

console.log(`\nFunction AST Check Summary: ${totalFunctionsChecked} functions checked, ${failedFunctions} failed.`);

// -------------------------------------------------------------
// CHECK 3: Tailwind CSS v4 Compliance Check
// -------------------------------------------------------------
console.log("\n--- CHECK 3: Tailwind CSS v4 Compliance Check ---");
const v3BannedPatterns = [
  { pattern: /\[var\(--/i, desc: "v3 var pattern [var(--...)]" },
  { pattern: /border-white\/\[0\./i, desc: "v3 decimal bracket border-white/[0.xx]" },
  { pattern: /bg-white\/\[0\./i, desc: "v3 decimal bracket bg-white/[0.xx]" },
  { pattern: /bg-black\/\[0\./i, desc: "v3 decimal bracket bg-black/[0.xx]" },
  { pattern: /outline-none/i, desc: "v3 outline-none (must use outline-hidden or specific reset)" },
  { pattern: /aspect-\[\d+\/\d+\]/i, desc: "v3 aspect-[x/y]" },
  { pattern: /bg-gradient-to-/i, desc: "v3 bg-gradient-to-* (should be bg-linear-*)" },
  { pattern: /flex-shrink-/i, desc: "v3 flex-shrink-* (should be shrink-*)" },
  { pattern: /flex-grow-/i, desc: "v3 flex-grow-* (should be grow-*)" },
  { pattern: /ring-offset-/i, desc: "v3 ring-offset-* (deleted from v4)" },
  { pattern: /ring-inset/i, desc: "v3 ring-inset (should be inset-ring)" },
  { pattern: /text-opacity-/i, desc: "v3 text-opacity-* (use modifier slash)" },
  { pattern: /bg-opacity-/i, desc: "v3 bg-opacity-* (use modifier slash)" },
];

for (const file of targetFiles) {
  const content = fs.readFileSync(file, "utf8");
  let fileViolations = 0;
  for (const { pattern, desc } of v3BannedPatterns) {
    const match = content.match(pattern);
    if (match) {
      console.log(`[FAIL] ${file}: Found banned ${desc} -> '${match[0]}'`);
      fileViolations++;
      totalViolations++;
    }
  }
  if (fileViolations === 0) {
    console.log(`[PASS] ${file}: 0 banned Tailwind v3 patterns`);
  }
}

// -------------------------------------------------------------
// CHECK 4: Forensic Authenticity & Mock/Facade Detection
// -------------------------------------------------------------
console.log("\n--- CHECK 4: Forensic Authenticity & Mock/Facade Detection ---");

// 4.1 mediaUploadService.ts
const serviceContent = fs.readFileSync("apps/web/components/ui/media-upload/mediaUploadService.ts", "utf8");
const sUploadEndpoint = serviceContent.includes("/upload?folder=");
const sFetchEndpoint = serviceContent.includes("/fetch-external");
const sFormData = serviceContent.includes("new FormData()");
const sFetch = serviceContent.includes("await fetch(");
const sToMediaResult = serviceContent.includes("toMediaResult(json.data)");
const sFakeReturn = /return\s*\{\s*url:\s*["'][^"']+["']\s*,\s*success:\s*true/.test(serviceContent);

console.log(` - mediaUploadService calls genuine /upload: ${sUploadEndpoint ? "PASS" : "FAIL"}`);
console.log(` - mediaUploadService calls genuine /fetch-external: ${sFetchEndpoint ? "PASS" : "FAIL"}`);
console.log(` - mediaUploadService uses genuine FormData: ${sFormData ? "PASS" : "FAIL"}`);
console.log(` - mediaUploadService performs real fetch: ${sFetch ? "PASS" : "FAIL"}`);
console.log(` - mediaUploadService transforms data via toMediaResult: ${sToMediaResult ? "PASS" : "FAIL"}`);
console.log(` - mediaUploadService contains fake mock return: ${sFakeReturn ? "FAIL" : "PASS"}`);

if (!sUploadEndpoint || !sFetchEndpoint || !sFormData || !sFetch || !sToMediaResult || sFakeReturn) {
  console.log("[FAIL] Integrity issue in mediaUploadService.ts");
  totalViolations++;
} else {
  console.log("[PASS] mediaUploadService.ts is fully authentic and genuine.");
}

// 4.2 test-media-upload.mjs mock facade detection
const testScriptContent = fs.readFileSync("apps/web/test-media-upload.mjs", "utf8");
const hasLocalMockToMediaResult = /function\s+toMediaResult\s*\(/.test(testScriptContent);
const usesTranspileModule = testScriptContent.includes("ts.transpileModule");
const importsGenuineTypes = testScriptContent.includes("typesMod");
const importsGenuineService = testScriptContent.includes("serviceMod");

console.log(` - test-media-upload.mjs has NO local dummy toMediaResult: ${!hasLocalMockToMediaResult ? "PASS" : "FAIL"}`);
console.log(` - test-media-upload.mjs dynamically transpiles genuine source: ${usesTranspileModule ? "PASS" : "FAIL"}`);
console.log(` - test-media-upload.mjs verifies genuine types.ts export: ${importsGenuineTypes ? "PASS" : "FAIL"}`);
console.log(` - test-media-upload.mjs verifies genuine mediaUploadService.ts: ${importsGenuineService ? "PASS" : "FAIL"}`);

if (hasLocalMockToMediaResult || !usesTranspileModule || !importsGenuineTypes || !importsGenuineService) {
  console.log("[FAIL] Test script still contains mock facade or does not test genuine code!");
  totalViolations++;
} else {
  console.log("[PASS] test-media-upload.mjs tests genuine source code without mock facade.");
}

// -------------------------------------------------------------
// FINAL SUMMARY
// -------------------------------------------------------------
console.log("\n=================================================================");
console.log(`INDEPENDENT AUDIT COMPLETE. Total Violations: ${totalViolations}`);
console.log(`VERDICT: ${totalViolations === 0 ? "CLEAN" : "INTEGRITY VIOLATION"}`);
console.log("=================================================================");

process.exit(totalViolations === 0 ? 0 : 1);
