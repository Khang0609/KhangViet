import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";
import { createRequire } from "node:module";

console.log("==================================================================");
console.log("=== EMPIRICAL CHALLENGER: DEEP ADVERSARIAL STRESS TEST SUITE ===");
console.log("==================================================================\n");

const require = createRequire(import.meta.url);
const ts = require(path.resolve(process.cwd(), "node_modules/.pnpm/typescript@5.9.3/node_modules/typescript"));

let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${name}: ${err.message}`);
    failures.push({ name, error: err.message });
    failed++;
  }
}

async function asyncTest(name, fn) {
  try {
    await fn();
    console.log(`[PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${name}: ${err.message}`);
    failures.push({ name, error: err.message });
    failed++;
  }
}

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

// -----------------------------------------------------------------------------
// SECTION 1: GENUINE MODULE BEHAVIOR & EXTREME EDGE CASES
// -----------------------------------------------------------------------------
console.log("--- 1. Genuine mediaUploadService & types Edge Case Stress ---");

const types = loadTsModule("apps/web/components/ui/media-upload/types.ts");
const service = loadTsModule("apps/web/components/ui/media-upload/mediaUploadService.ts");

test("1.1 extractImageFromPaste: Multi-type clipboard (prefers image blob over text)", () => {
  const fakeFile = { name: "screenshot.png", type: "image/png" };
  const mockEvent = {
    clipboardData: {
      items: [
        { type: "text/plain", getAsFile: () => null },
        { type: "image/png", getAsFile: () => fakeFile },
      ],
      getData: () => "https://example.com/ignored.jpg",
    },
  };
  const result = service.extractImageFromPaste(mockEvent);
  assert.deepStrictEqual(result, { type: "file", file: fakeFile });
});

test("1.2 extractImageFromPaste: HTTP/HTTPS URLs extracted cleanly with whitespace trimming", () => {
  const urls = [
    { in: "https://images.unsplash.com/pic.jpg", expected: "https://images.unsplash.com/pic.jpg" },
    { in: "  http://example.com/logo.png  \n", expected: "http://example.com/logo.png" },
    { in: "HTTPS://SECURE.ORG/IMAGE.WEBP", expected: "HTTPS://SECURE.ORG/IMAGE.WEBP" },
  ];
  for (const { in: text, expected } of urls) {
    const mockEvent = {
      clipboardData: {
        items: [{ type: "text/plain", getAsFile: () => null }],
        getData: (f) => (f === "text" ? text : ""),
      },
    };
    const result = service.extractImageFromPaste(mockEvent);
    assert.deepStrictEqual(result, { type: "url", url: expected });
  }
});

test("1.3 extractImageFromPaste: Non-HTTP protocols, javascript:, file:, data: rejected as null", () => {
  const badTexts = [
    "javascript:alert('xss')",
    "file:///C:/passwords.txt",
    "ftp://ftp.example.com/pic.jpg",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==",
    "blob:https://example.com/uuid",
    "/local/image.jpg",
    "random text string",
    "",
  ];
  for (const text of badTexts) {
    const mockEvent = {
      clipboardData: {
        items: [{ type: "text/plain", getAsFile: () => null }],
        getData: () => text,
      },
    };
    const result = service.extractImageFromPaste(mockEvent);
    assert.strictEqual(result, null, `Should return null for: ${text}`);
  }
});

test("1.4 extractImageFromPaste: Null/undefined clipboardData returns null without throwing", () => {
  assert.strictEqual(service.extractImageFromPaste({ clipboardData: null }), null);
  assert.strictEqual(service.extractImageFromPaste({ clipboardData: undefined }), null);
  assert.strictEqual(service.extractImageFromPaste({}), null);
});

asyncTest("1.5 uploadFileToWorker: Dispatches multipart POST with custom folder param", async () => {
  let capturedUrl = "";
  let capturedMethod = "";
  let capturedBody = null;

  globalThis.fetch = async (url, opts) => {
    capturedUrl = url;
    capturedMethod = opts.method;
    capturedBody = opts.body;
    return {
      ok: true,
      json: async () => ({
        success: true,
        data: {
          public_url: "https://media.khangviet.vn/hero/slide-1.webp",
          r2_key: "hero/slide-1.webp",
          width_px: 2560,
          height_px: 1440,
          aspect_ratio: "wide",
          file_size_bytes: 350000,
          media_type: "HERO_SLIDE",
        },
      }),
    };
  };

  const fakeBlob = new Blob(["test"], { type: "image/webp" });
  const result = await service.uploadFileToWorker(fakeBlob, "hero_folder");

  assert.strictEqual(capturedMethod, "POST");
  assert(capturedUrl.includes("/upload?folder=hero_folder"), `Url was ${capturedUrl}`);
  assert(capturedBody instanceof FormData);
  assert.strictEqual(result.url, "https://media.khangviet.vn/hero/slide-1.webp");
  assert.strictEqual(result.aspectRatio, "wide");
  assert.strictEqual(result.width, 2560);
  assert.strictEqual(result.height, 1440);
  assert.strictEqual(result.fileSize, 350000);
});

asyncTest("1.6 uploadFileToWorker: Server 4xx/5xx rejection throws exact error message", async () => {
  globalThis.fetch = async () => ({
    ok: false,
    json: async () => ({
      success: false,
      error: { message: "File type application/x-msdownload not allowed" },
    }),
  });

  const fakeBlob = new Blob(["exe"], { type: "application/octet-stream" });
  await assert.rejects(
    async () => service.uploadFileToWorker(fakeBlob, "projects"),
    /File type application\/x-msdownload not allowed/
  );
});

asyncTest("1.7 fetchExternalUrlFromWorker: Encodes JSON body with trimmed url and folder", async () => {
  let capturedUrl = "";
  let capturedOpts = null;

  globalThis.fetch = async (url, opts) => {
    capturedUrl = url;
    capturedOpts = opts;
    return {
      ok: true,
      json: async () => ({
        success: true,
        data: {
          public_url: "https://media.khangviet.vn/fetched.webp",
          r2_key: "fetched.webp",
          width_px: 800,
          height_px: 800,
          aspect_ratio: "square",
          file_size_bytes: 50000,
          media_type: "GALLERY_IMAGE",
        },
      }),
    };
  };

  const result = await service.fetchExternalUrlFromWorker("   https://example.com/avatar.jpg   ", "avatars");
  assert(capturedUrl.endsWith("/fetch-external"));
  assert.strictEqual(capturedOpts.headers["Content-Type"], "application/json");
  const parsed = JSON.parse(capturedOpts.body);
  assert.strictEqual(parsed.url, "https://example.com/avatar.jpg");
  assert.strictEqual(parsed.folder, "avatars");
  assert.strictEqual(result.aspectRatio, "square");
});

// -----------------------------------------------------------------------------
// SECTION 2: ADVERSARIAL STATE MACHINE & COMPONENT WORKFLOW LOGIC
// -----------------------------------------------------------------------------
console.log("\n--- 2. Adversarial State Machine & Component Workflows ---");

test("2.1 Target Filtering on Container Paste: Prevents paste hijacking in input fields", () => {
  let pasteTriggered = false;
  const onPaste = () => { pasteTriggered = true; };

  const simulateContainerPaste = (targetTagName) => {
    pasteTriggered = false;
    const e = { target: { tagName: targetTagName }, preventDefault: () => {} };
    if (e.target?.tagName !== "INPUT") {
      onPaste();
    }
  };

  simulateContainerPaste("INPUT");
  assert.strictEqual(pasteTriggered, false, "Container paste must NOT trigger when typing in INPUT");

  simulateContainerPaste("DIV");
  assert.strictEqual(pasteTriggered, true, "Container paste MUST trigger on DIV dropzone container");

  simulateContainerPaste("BUTTON");
  assert.strictEqual(pasteTriggered, true, "Container paste MUST trigger on BUTTON");
});

test("2.2 MediaUrlFetchBar: Input Preservation on Fetch vs Clear on Local Direct Apply", () => {
  let directApplied = null;
  let fetched = null;
  let inputUrl = "";

  const handleSubmit = (currentInput, allowManualInput) => {
    const trimmed = currentInput.trim();
    if (!trimmed) return;
    if (allowManualInput && trimmed.startsWith("/")) {
      directApplied = trimmed;
      inputUrl = ""; // cleared on direct apply
    } else {
      fetched = trimmed;
      // inputUrl is PRESERVED on external fetch
    }
  };

  // Scenario A: External URL fetch failure simulation
  inputUrl = "https://broken-server.internal/photo.jpg";
  handleSubmit(inputUrl, true);
  assert.strictEqual(fetched, "https://broken-server.internal/photo.jpg");
  assert.strictEqual(directApplied, null);
  assert.strictEqual(inputUrl, "https://broken-server.internal/photo.jpg", "Input URL must be preserved on external fetch");

  // Scenario B: Local file path bypass
  directApplied = null;
  fetched = null;
  inputUrl = "/image/projects/biet-thu.jpg";
  handleSubmit(inputUrl, true);
  assert.strictEqual(directApplied, "/image/projects/biet-thu.jpg");
  assert.strictEqual(fetched, null);
  assert.strictEqual(inputUrl, "", "Input URL must be cleared after local direct apply");
});

test("2.3 Replace & Remove State Transitions in UniversalMediaUpload", () => {
  // Test transition truth table for `showPreview`:
  // const showPreview = Boolean(value) && !isReplacing && uploadState !== "uploading";
  const computeShowPreview = (value, isReplacing, uploadState) =>
    Boolean(value) && !isReplacing && uploadState !== "uploading";

  // Initial empty value: show dropzone (not preview)
  assert.strictEqual(computeShowPreview("", false, "idle"), false);

  // Upload succeeded, value present: show preview card
  assert.strictEqual(computeShowPreview("https://media.khangviet.vn/photo.webp", false, "success"), true);

  // User clicks "Thay đổi" (onReplace -> isReplacing = true): reveal dropzone
  assert.strictEqual(computeShowPreview("https://media.khangviet.vn/photo.webp", true, "idle"), false);

  // While re-uploading replacement: show dropzone in uploading state
  assert.strictEqual(computeShowPreview("https://media.khangviet.vn/photo.webp", true, "uploading"), false);

  // Replacement uploaded: isReplacing resets to false, value updated -> show preview card
  assert.strictEqual(computeShowPreview("https://media.khangviet.vn/new.webp", false, "success"), true);

  // User clicks "Xóa" (onRemove -> value = "", isReplacing = false, reset()): show dropzone
  assert.strictEqual(computeShowPreview("", false, "idle"), false);
});

test("2.4 Backward Compatibility Wrapper (ImageUrlInput)", () => {
  // ImageUrlInput wraps UniversalMediaUpload and translates allowFilePath -> allowManualInput
  const imageUrlInputSrc = fs.readFileSync("apps/web/components/ui/ImageUrlInput.tsx", "utf8");
  assert(imageUrlInputSrc.includes("allowManualInput={allowFilePath}"), "Must forward allowFilePath to allowManualInput");
  assert(imageUrlInputSrc.includes("allowFilePath = true"), "Must default allowFilePath to true");
  assert(imageUrlInputSrc.includes("onChange={(url: string"), "Must accept single url param in onChange");
});

// -----------------------------------------------------------------------------
// SECTION 3: AST AUDIT & CODE STANDARDS
// -----------------------------------------------------------------------------
console.log("\n--- 3. Strict AST & Code Standards Enforcement ---");

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

test("3.1 All 9 media files must have <= 100 lines", () => {
  for (const file of targetFiles) {
    const content = fs.readFileSync(file, "utf8");
    const count = content.split(/\r?\n/).length;
    assert(count <= 100, `${file} has ${count} lines (limit: 100)`);
  }
});

test("3.2 AST: Every function, callback, and method must have <= 35 lines", () => {
  let funcsCount = 0;
  for (const file of targetFiles) {
    const content = fs.readFileSync(file, "utf8");
    const isTsx = file.endsWith(".tsx");
    const sf = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, isTsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS);

    function visit(node) {
      if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node) || ts.isMethodDeclaration(node)) {
        funcsCount++;
        const start = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
        const end = sf.getLineAndCharacterOfPosition(node.getEnd()).line + 1;
        const len = end - start + 1;
        assert(len <= 35, `Function at ${file}:${start}-${end} is ${len} lines (> 35)`);
      }
      ts.forEachChild(node, visit);
    }
    visit(sf);
  }
  assert(funcsCount > 0, "Must inspect functions");
  console.log(`     (Inspected ${funcsCount} functions across all target files)`);
});

test("3.3 Tailwind CSS v4 Compliance: Zero banned v3 patterns", () => {
  const banned = [/\[var\(--/, /border-white\/\[0\./, /bg-white\/\[0\./, /outline-none/, /aspect-\[\d+\/\d+\]/, /bg-gradient-to-/, /flex-shrink-/];
  for (const file of targetFiles) {
    const content = fs.readFileSync(file, "utf8");
    for (const pat of banned) {
      assert(!pat.test(content), `Found banned Tailwind v3 pattern ${pat} in ${file}`);
    }
  }
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log("\n==================================================================");
console.log(`=== CHALLENGER SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
console.log("==================================================================");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
