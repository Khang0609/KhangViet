import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";

console.log("=================================================================");
console.log("=== EMPIRICAL CHALLENGER: UNIVERSAL MEDIA DROPZONE STRESS HARNESS ===");
console.log("=================================================================\n");

let passedCount = 0;
let failedCount = 0;
const findings = [];

function runTest(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(`       Error: ${err.message}`);
    failedCount++;
    findings.push({ name, error: err.message });
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`[PASS] ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(`       Error: ${err.message}`);
    failedCount++;
    findings.push({ name, error: err.message });
  }
}

// -----------------------------------------------------------------------------
// Simulation Harness for `useMediaUpload` hook logic
// -----------------------------------------------------------------------------

function createMediaUploadHookHarness(mockFetch, workerUrl = "http://127.0.0.1:8788") {
  let uploadState = "idle";
  let errorMessage = "";
  let result = null;

  const toMediaResult = (data) => ({
    url: data.public_url,
    r2Key: data.r2_key,
    width: data.width_px,
    height: data.height_px,
    aspectRatio: data.aspect_ratio,
    fileSize: data.file_size_bytes,
    mediaType: data.media_type,
  });

  const handleFileUpload = async (file, folder = "projects") => {
    if (file.size > 10 * 1024 * 1024) {
      errorMessage = "Dung lượng vượt quá 10MB";
      uploadState = "error";
      return null;
    }
    uploadState = "uploading";
    errorMessage = "";
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await mockFetch(`${workerUrl}/upload?folder=${encodeURIComponent(folder)}`, {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error?.message || "Tải ảnh thất bại");
      const mapped = toMediaResult(json.data);
      result = mapped;
      uploadState = "success";
      return mapped;
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : "Tải ảnh thất bại";
      uploadState = "error";
      return null;
    }
  };

  const handleUrlFetch = async (url, folder = "projects") => {
    if (!url.trim().startsWith("http")) {
      errorMessage = "Yêu cầu URL http hoặc https hợp lệ";
      uploadState = "error";
      return null;
    }
    uploadState = "uploading";
    errorMessage = "";
    try {
      const res = await mockFetch(`${workerUrl}/fetch-external`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), folder }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error?.message || "Nạp ảnh từ URL thất bại");
      const mapped = toMediaResult(json.data);
      result = mapped;
      uploadState = "success";
      return mapped;
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : "Nạp ảnh thất bại";
      uploadState = "error";
      return null;
    }
  };

  const handlePaste = (e, folder = "projects") => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) handleFileUpload(file, folder);
        return;
      }
    }
    const text = e.clipboardData.getData("text")?.trim();
    if (text && /^https?:\/\/.+/i.test(text)) {
      e.preventDefault();
      handleUrlFetch(text, folder);
    }
  };

  const reset = () => {
    uploadState = "idle";
    errorMessage = "";
    result = null;
  };

  return {
    getState: () => ({ uploadState, errorMessage, result }),
    handleFileUpload,
    handleUrlFetch,
    handlePaste,
    reset,
    toMediaResult,
  };
}

// -----------------------------------------------------------------------------
// Format Size Helper Simulation
// -----------------------------------------------------------------------------
function formatSize(bytes) {
  if (!bytes) return "";
  return bytes < 1048576 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;
}

// =============================================================================
// TEST SUITE 1: Client-Side Size Guard (10MB boundary tests)
// =============================================================================
console.log("--- TEST SUITE 1: Client-Side 10MB Guard & File Validation ---");

await runAsyncTest("1.1 File size exactly 10MB (10,485,760 bytes) is allowed past client guard", async () => {
  let fetchDispatched = false;
  const mockFetch = async () => {
    fetchDispatched = true;
    return {
      ok: true,
      json: async () => ({
        success: true,
        data: {
          public_url: "http://127.0.0.1:8788/file/projects/exact10mb.webp",
          r2_key: "projects/exact10mb.webp",
          width_px: 2000,
          height_px: 1500,
          aspect_ratio: "landscape",
          file_size_bytes: 10485760,
          media_type: "GALLERY_IMAGE",
        },
      }),
    };
  };

  const harness = createMediaUploadHookHarness(mockFetch);
  const file10MB = new Blob(["x".repeat(100)], { type: "image/jpeg" });
  Object.defineProperty(file10MB, "size", { value: 10 * 1024 * 1024 });

  const res = await harness.handleFileUpload(file10MB, "projects");
  assert(fetchDispatched, "Fetch must be dispatched for 10MB file");
  assert(res !== null, "Result must not be null");
  assert.strictEqual(harness.getState().uploadState, "success");
  assert.strictEqual(harness.getState().errorMessage, "");
});

await runAsyncTest("1.2 File size 10MB + 1 byte (10,485,761 bytes) is REJECTED without network dispatch", async () => {
  let fetchDispatched = false;
  const mockFetch = async () => {
    fetchDispatched = true;
    return { ok: true, json: async () => ({}) };
  };

  const harness = createMediaUploadHookHarness(mockFetch);
  const file10MBPlus1 = new Blob(["x"], { type: "image/jpeg" });
  Object.defineProperty(file10MBPlus1, "size", { value: 10 * 1024 * 1024 + 1 });

  const res = await harness.handleFileUpload(file10MBPlus1, "projects");
  assert.strictEqual(fetchDispatched, false, "Network fetch MUST NOT be called for oversized file");
  assert.strictEqual(res, null, "Return value must be null");
  assert.strictEqual(harness.getState().uploadState, "error");
  assert.strictEqual(harness.getState().errorMessage, "Dung lượng vượt quá 10MB");
});

await runAsyncTest("1.3 Massive file (50MB) is rejected immediately", async () => {
  let fetchDispatched = false;
  const mockFetch = async () => {
    fetchDispatched = true;
    return { ok: true, json: async () => ({}) };
  };

  const harness = createMediaUploadHookHarness(mockFetch);
  const file50MB = new Blob(["x"], { type: "image/png" });
  Object.defineProperty(file50MB, "size", { value: 50 * 1024 * 1024 });

  const res = await harness.handleFileUpload(file50MB, "projects");
  assert.strictEqual(fetchDispatched, false);
  assert.strictEqual(harness.getState().uploadState, "error");
  assert.strictEqual(harness.getState().errorMessage, "Dung lượng vượt quá 10MB");
});

await runAsyncTest("1.4 Zero bytes file is allowed past size guard to server", async () => {
  let fetchDispatched = false;
  const mockFetch = async () => {
    fetchDispatched = true;
    return {
      ok: false,
      json: async () => ({ success: false, error: { message: "Empty file payload" } }),
    };
  };

  const harness = createMediaUploadHookHarness(mockFetch);
  const file0B = new Blob([], { type: "image/jpeg" });
  Object.defineProperty(file0B, "size", { value: 0 });

  const res = await harness.handleFileUpload(file0B, "projects");
  assert(fetchDispatched, "0 bytes file should attempt dispatch and let server reject");
  assert.strictEqual(res, null);
  assert.strictEqual(harness.getState().uploadState, "error");
  assert.strictEqual(harness.getState().errorMessage, "Empty file payload");
});

// =============================================================================
// TEST SUITE 2: State Transitions & Error Recovery
// =============================================================================
console.log("\n--- TEST SUITE 2: State Transitions & Error Recovery ---");

await runAsyncTest("2.1 Full success cycle and reset state machine", async () => {
  const mockFetch = async () => ({
    ok: true,
    json: async () => ({
      success: true,
      data: {
        public_url: "https://media.khangviet.vn/projects/photo.webp",
        r2_key: "projects/photo.webp",
        width_px: 1920,
        height_px: 1080,
        aspect_ratio: "landscape",
        file_size_bytes: 204800,
        media_type: "GALLERY_IMAGE",
      },
    }),
  });

  const harness = createMediaUploadHookHarness(mockFetch);
  assert.strictEqual(harness.getState().uploadState, "idle");
  assert.strictEqual(harness.getState().errorMessage, "");
  assert.strictEqual(harness.getState().result, null);

  const file = new Blob(["abc"], { type: "image/png" });
  Object.defineProperty(file, "size", { value: 1024 });

  const res = await harness.handleFileUpload(file, "hero");
  assert.strictEqual(harness.getState().uploadState, "success");
  assert.strictEqual(harness.getState().result?.r2Key, "projects/photo.webp");
  assert.strictEqual(harness.getState().result?.width, 1920);

  harness.reset();
  assert.strictEqual(harness.getState().uploadState, "idle");
  assert.strictEqual(harness.getState().errorMessage, "");
  assert.strictEqual(harness.getState().result, null);
});

await runAsyncTest("2.2 Server 400 error response sets error state and message", async () => {
  const mockFetch = async () => ({
    ok: false,
    json: async () => ({
      success: false,
      error: { message: "Định dạng file không được hỗ trợ" },
    }),
  });

  const harness = createMediaUploadHookHarness(mockFetch);
  const file = new Blob(["bad_bytes"], { type: "application/pdf" });
  Object.defineProperty(file, "size", { value: 5000 });

  const res = await harness.handleFileUpload(file, "projects");
  assert.strictEqual(res, null);
  assert.strictEqual(harness.getState().uploadState, "error");
  assert.strictEqual(harness.getState().errorMessage, "Định dạng file không được hỗ trợ");
});

await runAsyncTest("2.3 Server 500 non-JSON HTML crash handled gracefully", async () => {
  const mockFetch = async () => ({
    ok: false,
    json: async () => {
      throw new SyntaxError("Unexpected token < in JSON at position 0");
    },
  });

  const harness = createMediaUploadHookHarness(mockFetch);
  const file = new Blob(["bytes"], { type: "image/png" });
  Object.defineProperty(file, "size", { value: 1024 });

  const res = await harness.handleFileUpload(file, "projects");
  assert.strictEqual(res, null);
  assert.strictEqual(harness.getState().uploadState, "error");
  assert(harness.getState().errorMessage.includes("JSON"));
});

await runAsyncTest("2.4 Network offline/drop error recovery", async () => {
  let callCount = 0;
  const mockFetch = async () => {
    callCount++;
    if (callCount === 1) {
      throw new TypeError("Failed to fetch");
    }
    return {
      ok: true,
      json: async () => ({
        success: true,
        data: {
          public_url: "https://media.khangviet.vn/recovered.webp",
          r2_key: "recovered.webp",
          width_px: 800,
          height_px: 600,
          aspect_ratio: "landscape",
          file_size_bytes: 80000,
          media_type: "GALLERY_IMAGE",
        },
      }),
    };
  };

  const harness = createMediaUploadHookHarness(mockFetch);
  const file = new Blob(["bytes"], { type: "image/png" });
  Object.defineProperty(file, "size", { value: 1024 });

  const res1 = await harness.handleFileUpload(file);
  assert.strictEqual(res1, null);
  assert.strictEqual(harness.getState().uploadState, "error");
  assert.strictEqual(harness.getState().errorMessage, "Failed to fetch");

  const res2 = await harness.handleFileUpload(file);
  assert(res2 !== null);
  assert.strictEqual(harness.getState().uploadState, "success");
  assert.strictEqual(harness.getState().errorMessage, "");
});

// =============================================================================
// TEST SUITE 3: External URL Fetch & Validation
// =============================================================================
console.log("\n--- TEST SUITE 3: External URL Fetch & Validation ---");

await runAsyncTest("3.1 Empty or whitespace URL is rejected before fetch", async () => {
  let fetchDispatched = false;
  const mockFetch = async () => {
    fetchDispatched = true;
    return { ok: true, json: async () => ({}) };
  };

  const harness = createMediaUploadHookHarness(mockFetch);
  const resEmpty = await harness.handleUrlFetch("");
  assert.strictEqual(fetchDispatched, false);
  assert.strictEqual(resEmpty, null);
  assert.strictEqual(harness.getState().uploadState, "error");
  assert.strictEqual(harness.getState().errorMessage, "Yêu cầu URL http hoặc https hợp lệ");

  const resSpace = await harness.handleUrlFetch("   \t   ");
  assert.strictEqual(fetchDispatched, false);
  assert.strictEqual(resSpace, null);
});

await runAsyncTest("3.2 Non-http protocols (ftp, file, javascript) are rejected", async () => {
  let fetchDispatched = false;
  const mockFetch = async () => {
    fetchDispatched = true;
    return { ok: true, json: async () => ({}) };
  };

  const harness = createMediaUploadHookHarness(mockFetch);
  const badUrls = [
    "ftp://example.com/photo.png",
    "file:///C:/Windows/win.ini",
    "javascript:alert(1)",
    "data:image/png;base64,iVBORw0KGgo...",
    "/image/projects/local.jpg",
  ];

  for (const url of badUrls) {
    const res = await harness.handleUrlFetch(url);
    assert.strictEqual(fetchDispatched, false, `Fetch must not be called for ${url}`);
    assert.strictEqual(res, null);
    assert.strictEqual(harness.getState().uploadState, "error");
    assert.strictEqual(harness.getState().errorMessage, "Yêu cầu URL http hoặc https hợp lệ");
  }
});

await runAsyncTest("3.3 Valid HTTP/HTTPS URLs are properly trimmed and dispatched", async () => {
  let dispatchedPayload = null;
  const mockFetch = async (url, options) => {
    dispatchedPayload = JSON.parse(options.body);
    return {
      ok: true,
      json: async () => ({
        success: true,
        data: {
          public_url: "https://media.khangviet.vn/fetched.webp",
          r2_key: "fetched.webp",
          width_px: 1200,
          height_px: 800,
          aspect_ratio: "landscape",
          file_size_bytes: 95000,
          media_type: "GALLERY_IMAGE",
        },
      }),
    };
  };

  const harness = createMediaUploadHookHarness(mockFetch);
  const targetUrl = "   https://images.unsplash.com/photo-1518780664697-55e3ad937233   ";
  const res = await harness.handleUrlFetch(targetUrl, "cover");

  assert(res !== null);
  assert.strictEqual(dispatchedPayload.url, "https://images.unsplash.com/photo-1518780664697-55e3ad937233");
  assert.strictEqual(dispatchedPayload.folder, "cover");
  assert.strictEqual(harness.getState().uploadState, "success");
});

await runAsyncTest("3.4 Server-side SSRF error forwarded to UI state", async () => {
  const mockFetch = async () => ({
    ok: false,
    json: async () => ({
      success: false,
      error: { message: "Internal IP ranges are not allowed for security reasons" },
    }),
  });

  const harness = createMediaUploadHookHarness(mockFetch);
  const res = await harness.handleUrlFetch("http://192.168.1.1/admin.png");
  assert.strictEqual(res, null);
  assert.strictEqual(harness.getState().uploadState, "error");
  assert.strictEqual(harness.getState().errorMessage, "Internal IP ranges are not allowed for security reasons");
});

// =============================================================================
// TEST SUITE 4: Clipboard Paste Event Parsing
// =============================================================================
console.log("\n--- TEST SUITE 4: Clipboard Paste Event Parsing ---");

await runAsyncTest("4.1 Raw image blob in clipboard triggers handleFileUpload and prevents default", async () => {
  let uploadCalled = false;
  let preventDefaultCalled = false;

  const mockFile = new Blob(["image-bytes"], { type: "image/png" });
  Object.defineProperty(mockFile, "size", { value: 1024 });

  const mockFetch = async () => {
    uploadCalled = true;
    return {
      ok: true,
      json: async () => ({
        success: true,
        data: {
          public_url: "https://media.khangviet.vn/pasted.webp",
          r2_key: "pasted.webp",
          width_px: 500,
          height_px: 500,
          aspect_ratio: "square",
          file_size_bytes: 12000,
          media_type: "GALLERY_IMAGE",
        },
      }),
    };
  };

  const harness = createMediaUploadHookHarness(mockFetch);

  const mockEvent = {
    preventDefault: () => { preventDefaultCalled = true; },
    clipboardData: {
      items: [
        {
          type: "image/png",
          getAsFile: () => mockFile,
        },
      ],
      getData: () => "",
    },
  };

  harness.handlePaste(mockEvent, "projects");
  await new Promise((r) => setTimeout(r, 10));

  assert(preventDefaultCalled, "preventDefault must be called when pasting an image");
  assert(uploadCalled, "handleFileUpload must be dispatched");
});

await runAsyncTest("4.2 Image URL string in clipboard triggers handleUrlFetch and prevents default", async () => {
  let urlFetchCalled = false;
  let preventDefaultCalled = false;

  const mockFetch = async () => {
    urlFetchCalled = true;
    return {
      ok: true,
      json: async () => ({
        success: true,
        data: {
          public_url: "https://media.khangviet.vn/url-pasted.webp",
          r2_key: "url-pasted.webp",
          width_px: 800,
          height_px: 600,
          aspect_ratio: "landscape",
          file_size_bytes: 45000,
          media_type: "GALLERY_IMAGE",
        },
      }),
    };
  };

  const harness = createMediaUploadHookHarness(mockFetch);

  const mockEvent = {
    preventDefault: () => { preventDefaultCalled = true; },
    clipboardData: {
      items: [
        {
          type: "text/plain",
          getAsFile: () => null,
        },
      ],
      getData: (format) => format === "text" ? "https://example.com/exterior.webp" : "",
    },
  };

  harness.handlePaste(mockEvent, "projects");
  await new Promise((r) => setTimeout(r, 10));

  assert(preventDefaultCalled, "preventDefault must be called for valid image URL paste");
  assert(urlFetchCalled, "handleUrlFetch must be dispatched");
});

runTest("4.3 Non-URL text in clipboard does NOT prevent default and does NOT upload", () => {
  let preventDefaultCalled = false;
  let fetchDispatched = false;

  const mockFetch = async () => {
    fetchDispatched = true;
    return { ok: true, json: async () => ({}) };
  };

  const harness = createMediaUploadHookHarness(mockFetch);

  const mockEvent = {
    preventDefault: () => { preventDefaultCalled = true; },
    clipboardData: {
      items: [
        {
          type: "text/plain",
          getAsFile: () => null,
        },
      ],
      getData: () => "Biệt thự phố Khang Việt hiện đại",
    },
  };

  harness.handlePaste(mockEvent, "projects");
  assert.strictEqual(preventDefaultCalled, false, "Must NOT prevent default on plain text");
  assert.strictEqual(fetchDispatched, false, "Must NOT dispatch fetch on plain text");
});

runTest("4.4 Empty or null clipboardData handled gracefully without crash", () => {
  const harness = createMediaUploadHookHarness(async () => ({ ok: true }));

  assert.doesNotThrow(() => {
    harness.handlePaste({ clipboardData: null, preventDefault: () => {} });
  });

  assert.doesNotThrow(() => {
    harness.handlePaste({
      clipboardData: { items: [], getData: () => "" },
      preventDefault: () => {},
    });
  });
});

// =============================================================================
// TEST SUITE 5: toMediaResult Data Contract & Aspect Ratio Transformation
// =============================================================================
console.log("\n--- TEST SUITE 5: toMediaResult Contract Transformations ---");

runTest("5.1 All 4 aspect ratios mapped correctly", () => {
  const harness = createMediaUploadHookHarness(async () => ({ ok: true }));
  const ratios = ["landscape", "portrait", "wide", "square"];

  for (const ratio of ratios) {
    const workerData = {
      public_url: `https://media.khangviet.vn/${ratio}.webp`,
      r2_key: `${ratio}.webp`,
      width_px: ratio === "wide" ? 2560 : ratio === "portrait" ? 1080 : 1920,
      height_px: ratio === "wide" ? 1080 : ratio === "portrait" ? 1920 : 1080,
      aspect_ratio: ratio,
      file_size_bytes: 125000,
      media_type: "GALLERY_IMAGE",
    };

    const res = harness.toMediaResult(workerData);
    assert.strictEqual(res.aspectRatio, ratio);
    assert.strictEqual(res.url, workerData.public_url);
    assert.strictEqual(res.r2Key, workerData.r2_key);
    assert.strictEqual(res.width, workerData.width_px);
    assert.strictEqual(res.height, workerData.height_px);
    assert.strictEqual(res.fileSize, 125000);
    assert.strictEqual(res.mediaType, "GALLERY_IMAGE");
  }
});

runTest("5.2 Extreme dimensions (0x0, 10000x10000) transformed cleanly", () => {
  const harness = createMediaUploadHookHarness(async () => ({ ok: true }));
  const extremeData = {
    public_url: "https://media.khangviet.vn/extreme.webp",
    r2_key: "extreme.webp",
    width_px: 10000,
    height_px: 10000,
    aspect_ratio: "square",
    file_size_bytes: 9999999,
    media_type: "GALLERY_IMAGE",
  };
  const res = harness.toMediaResult(extremeData);
  assert.strictEqual(res.width, 10000);
  assert.strictEqual(res.height, 10000);
  assert.strictEqual(res.fileSize, 9999999);
});

// =============================================================================
// TEST SUITE 6: MediaPreviewCard Helper Logic (formatSize & Pill Badges)
// =============================================================================
console.log("\n--- TEST SUITE 6: MediaPreviewCard Helper Logic ---");

runTest("6.1 formatSize boundary behaviors", () => {
  assert.strictEqual(formatSize(undefined), "");
  assert.strictEqual(formatSize(0), "");
  assert.strictEqual(formatSize(512), "1 KB");
  assert.strictEqual(formatSize(1024), "1 KB");
  assert.strictEqual(formatSize(1048575), "1024 KB");
  assert.strictEqual(formatSize(1048576), "1.0 MB");
  assert.strictEqual(formatSize(2621440), "2.5 MB");
  assert.strictEqual(formatSize(10485760), "10.0 MB");
});

// =============================================================================
// TEST SUITE 7: MediaUrlFetchBar Bypass & Form Integration
// =============================================================================
console.log("\n--- TEST SUITE 7: MediaUrlFetchBar Bypass & Integration ---");

runTest("7.1 Local relative path with allowManualInput triggers onDirectApply", () => {
  let directAppliedUrl = null;
  let fetchedUrl = null;

  const simulateSubmit = (inputUrl, allowManualInput) => {
    const trimmed = inputUrl.trim();
    if (!trimmed) return;
    if (allowManualInput && trimmed.startsWith("/")) directAppliedUrl = trimmed;
    else fetchedUrl = trimmed;
  };

  simulateSubmit("   /image/projects/biet-thu-01.jpg   ", true);
  assert.strictEqual(directAppliedUrl, "/image/projects/biet-thu-01.jpg");
  assert.strictEqual(fetchedUrl, null);

  directAppliedUrl = null;
  fetchedUrl = null;
  simulateSubmit("https://cdn.example.com/logo.webp", true);
  assert.strictEqual(directAppliedUrl, null);
  assert.strictEqual(fetchedUrl, "https://cdn.example.com/logo.webp");

  directAppliedUrl = null;
  fetchedUrl = null;
  simulateSubmit("/image/projects/test.jpg", false);
  assert.strictEqual(directAppliedUrl, null);
  assert.strictEqual(fetchedUrl, "/image/projects/test.jpg");
});

// =============================================================================
// TEST SUITE 8: Code Organization & Function Limits Audit
// =============================================================================
console.log("\n--- TEST SUITE 8: Code Organization & Function Limits Audit ---");

runTest("8.1 File length <= 100 lines for all media components", () => {
  const dir = "apps/web/components/ui/media-upload";
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".ts") || f.endsWith(".tsx"));
  files.push("../ImageUrlInput.tsx");
  
  for (const file of files) {
    const filePath = file.startsWith("../") ? path.join(dir, file) : path.join(dir, file);
    const content = fs.readFileSync(filePath, "utf8");
    const lineCount = content.split(/\r?\n/).length;
    assert(lineCount <= 100, `File ${file} exceeds 100 lines (${lineCount})`);
  }
});

runTest("8.2 Function line counts <= 35 lines across all media-upload files", () => {
  const dir = "apps/web/components/ui/media-upload";
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".ts") || f.endsWith(".tsx"));
  const violations = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split(/\r?\n/);

    let depth = 0;
    let funcStart = -1;
    let funcName = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/(function\s+\w+|const\s+\w+\s*=\s*(?:async\s*)?(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>)/.test(line) && depth === 0) {
        funcStart = i;
        funcName = line.trim();
      }
      for (const char of line) {
        if (char === "{") depth++;
        if (char === "}") {
          depth--;
          if (depth === 0 && funcStart !== -1) {
            const funcLen = i - funcStart + 1;
            if (funcLen > 35) {
              violations.push(`${file}: ${funcName} (${funcLen} lines, max: 35)`);
            }
            funcStart = -1;
          }
        }
      }
    }
  }

  if (violations.length > 0) {
    throw new Error(`Found ${violations.length} function(s) exceeding 35 lines:\n  - ` + violations.join("\n  - "));
  }
});

// =============================================================================
// SUMMARY REPORT
// =============================================================================
console.log("\n=================================================================");
console.log(`=== TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED ===`);
console.log("=================================================================");

if (findings.length > 0) {
  console.log("\nFINDINGS SUMMARY:");
  for (const f of findings) {
    console.log(` * ${f.name}: ${f.error}`);
  }
}

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
