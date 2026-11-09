import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";
import { createRequire } from "node:module";

console.log("=== Khang Viet Design - Milestone 3 Media Upload Verification ===");

const require = createRequire(import.meta.url);
const ts = require(path.resolve(process.cwd(), "node_modules/.pnpm/typescript@5.9.3/node_modules/typescript"));

const filesToCheck = [
  { file: "apps/web/components/ui/media-upload/types.ts", maxLines: 50 },
  { file: "apps/web/components/ui/media-upload/mediaUploadService.ts", maxLines: 65 },
  { file: "apps/web/components/ui/media-upload/useMediaUpload.ts", maxLines: 70 },
  { file: "apps/web/components/ui/media-upload/MediaDropzoneView.tsx", maxLines: 90 },
  { file: "apps/web/components/ui/media-upload/MediaPreviewCard.tsx", maxLines: 80 },
  { file: "apps/web/components/ui/media-upload/MediaUrlFetchBar.tsx", maxLines: 80 },
  { file: "apps/web/components/ui/media-upload/UniversalMediaUpload.tsx", maxLines: 90 },
  { file: "apps/web/components/ui/media-upload/index.ts", maxLines: 15 },
  { file: "apps/web/components/ui/ImageUrlInput.tsx", maxLines: 50 },
];

console.log("\n1. Checking file line limits (Hard limit <= 100 lines):");
for (const { file, maxLines } of filesToCheck) {
  const content = fs.readFileSync(file, "utf8");
  const lines = content.split(/\r?\n/).length;
  console.log(` - ${file}: ${lines} lines (custom: <= ${maxLines}, hard: <= 100)`);
  assert(lines <= maxLines, `File ${file} exceeds custom limit: ${lines} > ${maxLines}`);
  assert(lines <= 100, `File ${file} exceeds hard limit 100 lines: ${lines}`);
}
console.log("✔ All files strictly satisfy line limit constraints!");

console.log("\n2. Checking Function Lengths via AST (Hard Limit <= 35 lines):");
let totalFuncs = 0;
for (const { file } of filesToCheck) {
  const content = fs.readFileSync(file, "utf8");
  const isTsx = file.endsWith(".tsx");
  const sf = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, isTsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  function visit(node) {
    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node) || ts.isMethodDeclaration(node)) {
      totalFuncs++;
      const start = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
      const end = sf.getLineAndCharacterOfPosition(node.getEnd()).line + 1;
      const len = end - start + 1;
      assert(len <= 35, `Function in ${file} at L${start}-L${end} exceeds 35 lines: ${len} lines`);
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
}
console.log(`✔ All ${totalFuncs} functions across all media files strictly satisfy <= 35 lines constraint!`);

console.log("\n3. Checking Tailwind CSS v4 syntax compliance:");
const v3BannedPatterns = [
  { pattern: /\[var\(--/i, desc: "v3 var pattern [var(--...)]" },
  { pattern: /border-white\/\[0\./i, desc: "v3 decimal bracket border-white/[0.xx]" },
  { pattern: /bg-white\/\[0\./i, desc: "v3 decimal bracket bg-white/[0.xx]" },
  { pattern: /outline-none/i, desc: "v3 outline-none (should be outline-hidden)" },
  { pattern: /aspect-\[\d+\/\d+\]/i, desc: "v3 aspect-[x/y]" },
  { pattern: /bg-gradient-to-/i, desc: "v3 bg-gradient-to-* (should be bg-linear-*)" },
  { pattern: /flex-shrink-/i, desc: "v3 flex-shrink-* (should be shrink-*)" },
];

for (const { file } of filesToCheck) {
  const content = fs.readFileSync(file, "utf8");
  for (const { pattern, desc } of v3BannedPatterns) {
    const match = content.match(pattern);
    assert(!match, `Found banned ${desc} in ${file}: ${match ? match[0] : ""}`);
  }
}
console.log("✔ Tailwind CSS v4 syntax 100% compliant!");

function loadTsModule(filePath) {
  const absPath = path.resolve(process.cwd(), filePath);
  const tsCode = fs.readFileSync(absPath, "utf8");
  const jsCode = ts.transpileModule(tsCode, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;

  const customRequire = (specifier) => {
    if (specifier === "./types" || specifier.endsWith("/types")) {
      return loadTsModule(path.resolve(path.dirname(absPath), "types.ts"));
    }
    return require(specifier);
  };

  const moduleExports = {};
  const fn = new Function("exports", "require", "module", "process", jsCode);
  fn(moduleExports, customRequire, { exports: moduleExports }, process);
  return moduleExports;
}

console.log("\n4. Verifying genuine toMediaResult from types.ts:");
const typesMod = await loadTsModule("apps/web/components/ui/media-upload/types.ts");
const { toMediaResult } = typesMod;
assert(typeof toMediaResult === "function", "toMediaResult must be exported as a function from types.ts");

const mockWorkerSuccess = {
  public_url: "https://media.khangviet.vn/projects/kv-01/test.webp",
  r2_key: "projects/kv-01/test.webp",
  width_px: 1920,
  height_px: 1080,
  aspect_ratio: "landscape",
  file_size_bytes: 145020,
  media_type: "GALLERY_IMAGE",
};

const transformed = toMediaResult(mockWorkerSuccess);
assert.strictEqual(transformed.url, mockWorkerSuccess.public_url);
assert.strictEqual(transformed.r2Key, mockWorkerSuccess.r2_key);
assert.strictEqual(transformed.width, 1920);
assert.strictEqual(transformed.height, 1080);
assert.strictEqual(transformed.aspectRatio, "landscape");
assert.strictEqual(transformed.fileSize, 145020);
console.log("✔ Genuine toMediaResult successfully transforms MediaWorker payload to MediaUploadResult!");

console.log("\n5. Verifying genuine mediaUploadService.ts exports:");
const serviceMod = await loadTsModule("apps/web/components/ui/media-upload/mediaUploadService.ts");
assert(typeof serviceMod.getMediaWorkerUrl === "function", "getMediaWorkerUrl must be exported");
assert(typeof serviceMod.uploadFileToWorker === "function", "uploadFileToWorker must be exported");
assert(typeof serviceMod.fetchExternalUrlFromWorker === "function", "fetchExternalUrlFromWorker must be exported");
assert(typeof serviceMod.extractImageFromPaste === "function", "extractImageFromPaste must be exported");
assert(serviceMod.getMediaWorkerUrl().startsWith("http"), "Default worker URL must start with http");
console.log("✔ Genuine mediaUploadService exports validated!");

console.log("\n6. Verifying backward compatibility wrapper (ImageUrlInput):");
const imageUrlInputContent = fs.readFileSync("apps/web/components/ui/ImageUrlInput.tsx", "utf8");
assert(imageUrlInputContent.includes("UniversalMediaUpload"), "ImageUrlInput must wrap UniversalMediaUpload");
assert(imageUrlInputContent.includes("allowFilePath"), "ImageUrlInput must support allowFilePath");
assert(imageUrlInputContent.includes("export * from \"./media-upload\""), "ImageUrlInput must re-export media-upload");
console.log("✔ ImageUrlInput backward compatibility wrapper is intact!");

console.log("\n7. Verifying index.ts exports:");
const indexContent = fs.readFileSync("apps/web/components/ui/media-upload/index.ts", "utf8");
assert(indexContent.includes("export * from \"./types\""), "index.ts must export types");
assert(indexContent.includes("export * from \"./mediaUploadService\""), "index.ts must export mediaUploadService");
assert(indexContent.includes("export * from \"./useMediaUpload\""), "index.ts must export useMediaUpload");
assert(indexContent.includes("export * from \"./UniversalMediaUpload\""), "index.ts must export UniversalMediaUpload");
console.log("✔ media-upload index.ts public exports verified!");

console.log("\nAll Milestone 3 verification checks PASSED successfully!");
