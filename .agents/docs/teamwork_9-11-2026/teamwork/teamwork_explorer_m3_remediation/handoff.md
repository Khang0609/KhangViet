# Handoff Report: Milestone 3 Remediation Blueprint (Admin UI Universal Media Dropzone)

**Agent**: Explorer 7 (Milestone 3 Remediation Architect)  
**State Folder**: `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_explorer_m3_remediation`  
**Working Directory**: `e:\lap_trinh\Project\website\KhangVietDesign\source`  
**Target Milestone**: Milestone 3 (`apps/web` Admin UI Universal Media Dropzone)  
**Assigned Worker**: Worker 6 (Milestone 3 Remediation Implementer)  
**Date**: 2026-11-08  
**Status**: COMPLETE (HARD HANDOFF)

---

## 1. Observation

### 1.1. Forensic Audit Violations Confirmed (AST Function Length Analysis)
Direct execution of the forensic AST check script (`node .agents/teamwork/teamwork_auditor_m3_1/audit-check.mjs`) using TypeScript 5.9.3 parser confirmed 4 function violations exceeding the project hard limit of 35 lines (`.agents/rules/code-organization.md` §4):

1. **`apps/web/components/ui/media-upload/useMediaUpload.ts`**:
   - Function `useMediaUpload` spans lines 9–94: **86 lines** (hard limit $\le 35$ lines, over by 51 lines / +145%).
   - Root cause: Inlining FormData packaging, endpoint URLs, and network request logic inside `useCallback` functions within the hook body. The AST line span of an enclosing function includes all lines of its nested callbacks.
2. **`apps/web/components/ui/media-upload/MediaDropzoneView.tsx`**:
   - Function `MediaDropzoneView` spans lines 36–74: **39 lines** (hard limit $\le 35$ lines, over by 4 lines).
   - Root cause: File input element, drag event listeners, and drag state were defined inside the main component body without sub-component delegation.
3. **`apps/web/components/ui/media-upload/MediaUrlFetchBar.tsx`**:
   - Function `MediaUrlFetchBar` spans lines 28–63: **36 lines** (hard limit $\le 35$ lines, over by 1 line).
   - Root cause: Text input JSX and inline form submission handling were bundled directly inside the parent component.
4. **`apps/web/components/ui/media-upload/UniversalMediaUpload.tsx`**:
   - Function `UniversalMediaUpload` spans lines 48–84: **37 lines** (hard limit $\le 35$ lines, over by 2 lines).
   - Root cause: Both file selection and external URL dispatch handlers, state transitions, and preview switching logic were defined inside the component.

### 1.2. Verification Test Suite Integrity Issue
Direct inspection of `apps/web/test-media-upload.mjs` lines 59–70 confirmed Reviewer Finding 1:
```javascript
// apps/web/test-media-upload.mjs: lines 59-70
// Simulate toMediaResult
function toMediaResult(data) {
  return {
    url: data.public_url,
    r2Key: data.r2_key,
    width: data.width_px,
    height: data.height_px,
    aspectRatio: data.aspect_ratio,
    fileSize: data.file_size_bytes,
    mediaType: data.media_type,
  };
}
```
The test suite created a local dummy function `toMediaResult` rather than importing and verifying the genuine contract export in `apps/web/components/ui/media-upload/types.ts`. Furthermore, `test-media-upload.mjs` checked file lengths and Tailwind v4 syntax but completely omitted automated function length verification, allowing the 4 violations to slip through.

### 1.3. Additional UX & Robustness Findings Observed
1. **Premature Input URL Erasure (`MediaUrlFetchBar.tsx`)**:
   In `MediaUrlFetchBar.tsx` lines 41–42, `setInputUrl("")` was called immediately before `onFetch(trimmed)`. If the external fetch fails (invalid URL, network timeout, SSRF rejection), the user's input URL has already been lost, degrading user experience.
2. **Paste Hijacking on Text Inputs (`UniversalMediaUpload.tsx`)**:
   In `DropzoneContainer` (lines 41–46), attaching `onPaste={(e) => onPaste(e, folder)}` without checking whether `e.target` is an `<input>` element causes paste events in the URL input field to be intercepted prematurely.
3. **Next.js Production Build Stale Lock (`EPERM`)**:
   `npx next build --webpack` encountered `EPERM` when stale artifacts existed in `apps/web/.next`. After purging `apps/web/.next`, `next build --webpack` executed cleanly with exit code 0 (`✓ Compiled successfully in 9.6s`, `Finished TypeScript in 4.5s`, static pages generated in 2.1s).

---

## 2. Logic Chain

1. **Rule Enforcement**:
   `.agents/rules/code-organization.md` §4 establishes non-negotiable boundaries:
   - File length: $\le 100$ lines.
   - Function length: $\le 35$ lines.
   Any file or function exceeding these thresholds fails automated CI and Forensic Integrity Audits.
2. **Architectural Separation of Concerns**:
   Network calls (`fetch`, `FormData`, endpoint resolution) and clipboard blob extraction have no business being trapped inside a React hook body (`useMediaUpload.ts`). Moving them to a pure TypeScript service (`mediaUploadService.ts`):
   - Makes the network logic decoupled and independently unit-testable without a DOM/React environment.
   - Drops `useMediaUpload.ts` from 94 lines down to ~60 lines.
   - Drops `useMediaUpload()` from 86 lines down to 23 lines (well below the 30-line design target).
3. **Component Decomposition**:
   - In `MediaDropzoneView.tsx`: Extracting `DropzoneFileInput` (11 lines) and `useDropzoneDrag` (10 lines) reduces `MediaDropzoneView` from 39 lines down to 26 lines.
   - In `MediaUrlFetchBar.tsx`: Extracting `UrlInputField` (12 lines) and preserving `inputUrl` during external fetch reduces `MediaUrlFetchBar` from 36 lines down to 29 lines.
   - In `UniversalMediaUpload.tsx`: Extracting `useUniversalHandlers` (20 lines) and filtering paste events on input elements reduces `UniversalMediaUpload` from 37 lines down to 25 lines.
4. **Test Integrity Guarantee**:
   Using `ts.transpileModule` in `test-media-upload.mjs` allows Node.js to dynamically evaluate `types.ts` and `mediaUploadService.ts` without local mock facades. Integrating the TypeScript AST function line checker directly into `test-media-upload.mjs` ensures that any future function exceeding 35 lines immediately fails the build.
5. **Blueprint Pre-Validation**:
   The entire blueprint was coded into a test harness (`test-blueprint-ast.mjs`) and executed against TypeScript 5.9.3 AST parser. Result: **0 Violations detected, 100% compliance across all 5 modified/new files**.

---

## 3. Caveats

- **Backward Compatibility**: All existing public interfaces (`UniversalMediaUploadProps`, `MediaUploadResult`, `useMediaUpload()` return signature, `ImageUrlInputProps`, and `media-upload/index.ts` re-exports) remain 100% identical. No consumer component (`ProjectFormFields.tsx`, `ProjectGalleryRow.tsx`, `HeroSlideItem.tsx`) requires changes.
- **Windows Build Environment**: Windows sandbox environments may hold file handles on `.next` during interrupted builds. A clean step (`Remove-Item -Recurse -Force .next`) before `next build` guarantees a reliable clean build.

---

## 4. Conclusion & Actionable Blueprint for Worker 6

### 4.1. File Layout Summary & Line Count Targets

| File Path | Nature | Target Lines | Max Function Lines | Status |
| :--- | :---: | :---: | :---: | :---: |
| `apps/web/components/ui/media-upload/types.ts` | Existing | 45 lines | 11 lines (`toMediaResult`) | PASS |
| `apps/web/components/ui/media-upload/mediaUploadService.ts` | **NEW** | **57 lines** | **18 lines** (`extractImageFromPaste`) | PASS |
| `apps/web/components/ui/media-upload/useMediaUpload.ts` | Refactor | **59 lines** | **24 lines** (`useUploadState`) | PASS |
| `apps/web/components/ui/media-upload/MediaDropzoneView.tsx` | Refactor | **87 lines** | **26 lines** (`MediaDropzoneView`) | PASS |
| `apps/web/components/ui/media-upload/MediaPreviewCard.tsx` | Existing | 79 lines | 22 lines (`MediaMetaBadges`) | PASS |
| `apps/web/components/ui/media-upload/MediaUrlFetchBar.tsx` | Refactor | **74 lines** | **29 lines** (`MediaUrlFetchBar`) | PASS |
| `apps/web/components/ui/media-upload/UniversalMediaUpload.tsx` | Refactor | **83 lines** | **25 lines** (`UniversalMediaUpload`) | PASS |
| `apps/web/components/ui/media-upload/index.ts` | Refactor | **8 lines** | 0 lines | PASS |
| `apps/web/components/ui/ImageUrlInput.tsx` | Existing | 41 lines | 19 lines (`ImageUrlInput`) | PASS |
| `apps/web/test-media-upload.mjs` | Refactor | **~120 lines** | Script harness with AST + dynamic imports | PASS |

---

### 4.2. Exact Code Specifications for Worker 6

#### Step 1: Create `apps/web/components/ui/media-upload/mediaUploadService.ts` (57 lines)
```ts
import { type MediaUploadResult, toMediaResult } from "./types";

export function getMediaWorkerUrl(): string {
  return process.env.NEXT_PUBLIC_MEDIA_WORKER_URL || "http://127.0.0.1:8788";
}

export async function uploadFileToWorker(
  file: File | Blob,
  folder = "projects"
): Promise<MediaUploadResult> {
  const fd = new FormData();
  fd.append("file", file);
  const endpoint = `${getMediaWorkerUrl()}/upload?folder=${encodeURIComponent(folder)}`;
  const res = await fetch(endpoint, { method: "POST", body: fd });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || "Tải ảnh thất bại");
  }
  return toMediaResult(json.data);
}

export async function fetchExternalUrlFromWorker(
  url: string,
  folder = "projects"
): Promise<MediaUploadResult> {
  const endpoint = `${getMediaWorkerUrl()}/fetch-external`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: url.trim(), folder }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || "Nạp ảnh từ URL thất bại");
  }
  return toMediaResult(json.data);
}

export function extractImageFromPaste(
  e: React.ClipboardEvent
): { type: "file"; file: File } | { type: "url"; url: string } | null {
  const items = e.clipboardData?.items;
  if (items) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) return { type: "file", file };
      }
    }
  }
  const text = e.clipboardData?.getData("text")?.trim();
  if (text && /^https?:\/\/.+/i.test(text)) {
    return { type: "url", url: text };
  }
  return null;
}
```

#### Step 2: Refactor `apps/web/components/ui/media-upload/useMediaUpload.ts` (59 lines)
```ts
"use client";

import { useState, useCallback } from "react";
import type { UploadState, MediaUploadResult } from "./types";
import {
  uploadFileToWorker,
  fetchExternalUrlFromWorker,
  extractImageFromPaste,
} from "./mediaUploadService";

function useUploadState() {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<MediaUploadResult | null>(null);

  const runTask = useCallback(async (task: () => Promise<MediaUploadResult>) => {
    setUploadState("uploading");
    setErrorMessage("");
    try {
      const res = await task();
      setResult(res);
      setUploadState("success");
      return res;
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Thao tác thất bại");
      setUploadState("error");
      return null;
    }
  }, []);

  const fail = useCallback((msg: string) => { setErrorMessage(msg); setUploadState("error"); }, []);
  const reset = useCallback(() => { setUploadState("idle"); setErrorMessage(""); setResult(null); }, []);
  return { uploadState, errorMessage, result, runTask, fail, reset };
}

export function useMediaUpload() {
  const { uploadState, errorMessage, result, runTask, fail, reset } = useUploadState();

  const handleFileUpload = useCallback(async (file: File | Blob, folder = "projects") => {
    if (file.size > 10 * 1024 * 1024) { fail("Dung lượng vượt quá 10MB"); return null; }
    return runTask(() => uploadFileToWorker(file, folder));
  }, [runTask, fail]);

  const handleUrlFetch = useCallback(async (url: string, folder = "projects") => {
    if (!url.trim().startsWith("http")) { fail("Yêu cầu URL http hoặc https hợp lệ"); return null; }
    return runTask(() => fetchExternalUrlFromWorker(url, folder));
  }, [runTask, fail]);

  const handlePaste = useCallback((e: React.ClipboardEvent, folder = "projects") => {
    const p = extractImageFromPaste(e);
    if (!p) return;
    e.preventDefault();
    if (p.type === "file") handleFileUpload(p.file, folder);
    else handleUrlFetch(p.url, folder);
  }, [handleFileUpload, handleUrlFetch]);

  return { uploadState, errorMessage, result, handleFileUpload, handleUrlFetch, handlePaste, reset };
}
```

#### Step 3: Refactor `apps/web/components/ui/media-upload/MediaDropzoneView.tsx` (87 lines)
```tsx
"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Loader2 } from "lucide-react";

interface MediaDropzoneViewProps {
  isUploading: boolean;
  onFileSelected: (file: File) => void;
  onPaste?: (e: React.ClipboardEvent) => void;
}

const DropzoneUploading: React.FC = () => (
  <div className="flex flex-col items-center py-2">
    <Loader2 className="h-8 w-8 animate-spin text-(--accent-bronze)" />
    <p className="mt-2 font-mono-tech text-xs text-white/70">Đang nén WebP & lưu trữ R2...</p>
  </div>
);

const DropzoneIdle: React.FC<{ onBrowse: () => void }> = ({ onBrowse }) => (
  <div className="flex flex-col items-center text-center">
    <UploadCloud className="h-8 w-8 text-(--accent-bronze)" />
    <p className="mt-2 font-sans text-xs text-white/80">Kéo & thả ảnh vào đây, hoặc</p>
    <button
      type="button"
      onClick={onBrowse}
      className="mt-1.5 rounded bg-white/10 px-3 py-1 font-mono-tech text-[11px] text-white transition-colors hover:bg-white/15 focus:outline-hidden"
    >
      Chọn tệp từ máy...
    </button>
    <span className="mt-2 font-mono-tech text-[10px] text-white/40">
      Hỗ trợ JPG, PNG, WebP (Tối đa 10MB) • Phím tắt: Ctrl + V
    </span>
  </div>
);

const DropzoneFileInput = React.forwardRef<
  HTMLInputElement,
  { onSelect: (file: File) => void }
>(({ onSelect }, ref) => (
  <input
    ref={ref}
    type="file"
    accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
    className="hidden"
    onChange={(e) => { const f = e.target.files?.[0]; if (f) onSelect(f); }}
  />
));
DropzoneFileInput.displayName = "DropzoneFileInput";

function useDropzoneDrag(onFileSelected: (file: File) => void) {
  const [isDragging, setIsDragging] = useState(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) onFileSelected(file);
  };
  return { isDragging, setIsDragging, handleDrop };
}

export const MediaDropzoneView: React.FC<MediaDropzoneViewProps> = ({
  isUploading,
  onFileSelected,
  onPaste,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isDragging, setIsDragging, handleDrop } = useDropzoneDrag(onFileSelected);

  const borderClass = isDragging
    ? "border-(--accent-bronze) bg-(--accent-bronze)/10"
    : "border-white/15 bg-white/2 hover:border-white/25 hover:bg-white/4";

  return (
    <div
      tabIndex={0}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
      onDrop={handleDrop}
      onPaste={onPaste}
      className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors focus:outline-hidden ${borderClass}`}
    >
      <DropzoneFileInput ref={fileInputRef} onSelect={onFileSelected} />
      {isUploading ? <DropzoneUploading /> : <DropzoneIdle onBrowse={() => fileInputRef.current?.click()} />}
    </div>
  );
};
```

#### Step 4: Refactor `apps/web/components/ui/media-upload/MediaUrlFetchBar.tsx` (74 lines)
```tsx
"use client";

import React, { useState } from "react";
import { Link as LinkIcon, Download, Loader2 } from "lucide-react";

interface MediaUrlFetchBarProps {
  onFetch: (url: string) => void;
  isLoading: boolean;
  allowManualInput?: boolean;
  onDirectApply?: (url: string) => void;
}

const UrlSubmitBtn: React.FC<{ isLoading: boolean; disabled: boolean; isLocal: boolean }> = ({
  isLoading,
  disabled,
  isLocal,
}) => (
  <button
    type="submit"
    disabled={disabled}
    className="flex shrink-0 items-center gap-1.5 rounded border border-(--accent-bronze)/40 bg-(--accent-bronze)/15 px-3 py-1.5 font-mono-tech text-xs text-(--accent-bronze) transition-colors hover:bg-(--accent-bronze)/25 disabled:opacity-40 focus:outline-hidden"
  >
    {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
    <span>{isLocal ? "Áp dụng" : "Nạp về R2"}</span>
  </button>
);

const UrlInputField: React.FC<{
  value: string;
  onChange: (val: string) => void;
  allowManualInput?: boolean;
}> = ({ value, onChange, allowManualInput }) => (
  <div className="relative flex-1">
    <LinkIcon className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={allowManualInput ? "https://... hoặc /image/..." : "https://..."}
      className="w-full rounded border border-white/10 bg-white/4 py-1.5 pr-3 pl-8.5 font-mono-tech text-xs text-white placeholder:text-white/20 focus:border-(--accent-bronze) focus:outline-hidden"
    />
  </div>
);

export const MediaUrlFetchBar: React.FC<MediaUrlFetchBarProps> = ({
  onFetch,
  isLoading,
  allowManualInput,
  onDirectApply,
}) => {
  const [inputUrl, setInputUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputUrl.trim();
    if (!trimmed) return;
    if (allowManualInput && trimmed.startsWith("/")) {
      onDirectApply?.(trimmed);
      setInputUrl("");
    } else {
      onFetch(trimmed);
    }
  };

  const isLocal = Boolean(allowManualInput && inputUrl.trim().startsWith("/"));

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <UrlInputField value={inputUrl} onChange={setInputUrl} allowManualInput={allowManualInput} />
      <UrlSubmitBtn isLoading={isLoading} disabled={isLoading || !inputUrl.trim()} isLocal={isLocal} />
    </form>
  );
};
```

#### Step 5: Refactor `apps/web/components/ui/media-upload/UniversalMediaUpload.tsx` (83 lines)
```tsx
"use client";

import React, { useState } from "react";
import type { UniversalMediaUploadProps, MediaUploadResult } from "./types";
import { useMediaUpload } from "./useMediaUpload";
import { MediaDropzoneView } from "./MediaDropzoneView";
import { MediaPreviewCard } from "./MediaPreviewCard";
import { MediaUrlFetchBar } from "./MediaUrlFetchBar";

const UploadHeader: React.FC<{ label: string; allowManualInput?: boolean }> = ({ label, allowManualInput }) => (
  <div className="flex items-center justify-between">
    <label className="block font-mono-tech text-xs tracking-wider text-(--text-secondary) uppercase">{label}</label>
    {allowManualInput && <span className="font-mono-tech text-[10px] text-(--accent-bronze)">[File Path Bypass: ON]</span>}
  </div>
);

const ErrorBanner: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="flex items-center justify-between rounded border border-red-500/30 bg-red-500/10 p-2 font-mono-tech text-xs text-red-400">
    <span>{message || "Lỗi tải ảnh"}</span>
    <button type="button" onClick={onRetry} className="underline focus:outline-hidden">Thử lại</button>
  </div>
);

const DropzoneContainer: React.FC<{
  folder: string; isUploading: boolean; allowManualInput?: boolean;
  onPaste: (e: React.ClipboardEvent, folder: string) => void;
  onSelectFile: (file: File) => void; onFetch: (url: string) => void; onDirectApply: (url: string) => void;
}> = ({ folder, isUploading, allowManualInput, onPaste, onSelectFile, onFetch, onDirectApply }) => (
  <div tabIndex={0} onPaste={(e) => { if ((e.target as HTMLElement)?.tagName !== "INPUT") onPaste(e, folder); }} className="space-y-2 focus:outline-hidden">
    <MediaDropzoneView isUploading={isUploading} onFileSelected={onSelectFile} />
    <MediaUrlFetchBar onFetch={onFetch} isLoading={isUploading} allowManualInput={allowManualInput} onDirectApply={onDirectApply} />
  </div>
);

function useUniversalHandlers(
  folder: string,
  onChange: (url: string, metadata?: MediaUploadResult) => void
) {
  const upload = useMediaUpload();
  const [isReplacing, setIsReplacing] = useState(false);

  const handleSelectFile = async (file: File) => {
    const res = await upload.handleFileUpload(file, folder);
    if (res) { onChange(res.url, res); setIsReplacing(false); }
  };
  const handleFetch = async (url: string) => {
    const res = await upload.handleUrlFetch(url, folder);
    if (res) { onChange(res.url, res); setIsReplacing(false); }
  };
  const handleRemove = () => { onChange(""); upload.reset(); setIsReplacing(false); };
  const handleDirectApply = (u: string) => { onChange(u); setIsReplacing(false); };

  return { ...upload, isReplacing, setIsReplacing, handleSelectFile, handleFetch, handleRemove, handleDirectApply };
}

export const UniversalMediaUpload: React.FC<UniversalMediaUploadProps> = ({
  label,
  value,
  onChange,
  helperText,
  allowManualInput,
  folder = "projects",
  className,
}) => {
  const h = useUniversalHandlers(folder, onChange);
  const showPreview = Boolean(value) && !h.isReplacing && h.uploadState !== "uploading";

  return (
    <div className={`space-y-2 ${className || ""}`}>
      <UploadHeader label={label} allowManualInput={allowManualInput} />
      {h.uploadState === "error" && <ErrorBanner message={h.errorMessage} onRetry={h.reset} />}
      {showPreview ? (
        <MediaPreviewCard url={value} metadata={h.result} onReplace={() => h.setIsReplacing(true)} onRemove={h.handleRemove} />
      ) : (
        <DropzoneContainer folder={folder} isUploading={h.uploadState === "uploading"} allowManualInput={allowManualInput} onPaste={h.handlePaste} onSelectFile={h.handleSelectFile} onFetch={h.handleFetch} onDirectApply={h.handleDirectApply} />
      )}
      {helperText && <p className="font-sans text-[11px] text-white/40">{helperText}</p>}
    </div>
  );
};

export default UniversalMediaUpload;
```

#### Step 6: Update `apps/web/components/ui/media-upload/index.ts` (8 lines)
```ts
export * from "./types";
export * from "./mediaUploadService";
export * from "./useMediaUpload";
export * from "./MediaDropzoneView";
export * from "./MediaPreviewCard";
export * from "./MediaUrlFetchBar";
export * from "./UniversalMediaUpload";
```

#### Step 7: Update `apps/web/test-media-upload.mjs` (Genuine Imports & AST Check)
```javascript
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
  { file: "apps/web/components/ui/media-upload/useMediaUpload.ts", maxLines: 65 },
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

async function loadTsModule(filePath) {
  const tsCode = fs.readFileSync(filePath, "utf8");
  const jsCode = ts.transpileModule(tsCode, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const dataUri = "data:text/javascript;base64," + Buffer.from(jsCode).toString("base64");
  return import(dataUri);
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
```

---

## 5. Verification Method

Once Worker 6 completes implementation following this blueprint, execute the following commands in sequence to verify:

1. **Automated Unit & Integrity Verification**:
   ```bash
   node apps/web/test-media-upload.mjs
   ```
   *Expected outcome*: Exits with code 0. Reports all 9 files $\le 100$ lines, all functions $\le 35$ lines, genuine `toMediaResult` and `mediaUploadService` imports verified.

2. **Challenger Adversarial Stress Harness**:
   ```bash
   node apps/web/test-stress-dropzone.mjs
   ```
   *Expected outcome*: Exits with code 0. Reports **22 PASSED, 0 FAILED** (previously Suite 8.2 failed on `useMediaUpload`).

3. **Forensic Integrity Auditor AST Audit**:
   ```bash
   node .agents/teamwork/teamwork_auditor_m3_1/audit-check.mjs
   ```
   *Expected outcome*: Exits with code 0. Reports **VERDICT: CLEAN (0 Violations)**.

4. **TypeScript Strict Typecheck**:
   ```bash
   node ./node_modules/.pnpm/typescript@5.9.3/node_modules/typescript/bin/tsc --noEmit -p apps/web/tsconfig.json
   ```
   *Expected outcome*: Exits with code 0 (0 compilation errors).

5. **Next.js Production Build**:
   ```bash
   cmd.exe /c "if exist apps\web\.next rmdir /s /q apps\web\.next && cd apps\web && npx next build --webpack"
   ```
   *Expected outcome*: Exits with code 0. Webpack compilation and static generation succeed cleanly without `EPERM` locks.

6. **Regression Verification of Monorepo Modules**:
   ```bash
   pnpm --filter @khangviet/repositories test
   node apps/api/test-e2e.mjs
   node apps/media-worker/test-e2e.mjs
   ```
   *Expected outcome*: All test suites pass with 100% green exit code 0.
