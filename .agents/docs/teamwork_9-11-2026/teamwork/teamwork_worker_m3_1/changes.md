# Changes: Milestone 3 - Admin UI Universal Media Dropzone

**Agent**: Worker 5 (`teamwork_worker_m3_1`)  
**Scope**: `apps/web` Media Management, `UniversalMediaUpload` Modular Component, Backward Compatibility Wrapper in `ImageUrlInput.tsx`, and Verification Testing.  
**Date**: 2026-11-08  

---

## 1. Summary of Changes

Milestone 3 elevates the administrative media management in `apps/web` from a text-only input to a production-grade **Universal Media Dropzone** supporting all 4 upload modes:
1. **Browse File Dialog** (`<input type="file">` trigger via button or dropzone).
2. **Drag & Drop** (`onDragOver`, `onDragLeave`, `onDrop` with bronze visual feedback).
3. **Clipboard Paste** (`Ctrl+V` detection for raw image blobs and direct image URL strings).
4. **External URL Fetch** (`/fetch-external` endpoint on Cloudflare Media Worker to download, compress WebP, and persist to R2).

All implementations are genuine, strictly comply with the Code Organization rules (every file $\le 100$ lines, every function $\le 35$ lines), use Tailwind CSS v4 syntax, and maintain 100% backward compatibility for all existing call sites (`ProjectFormFields.tsx`, `ProjectGalleryRow.tsx`, `HeroSlideItem.tsx`).

---

## 2. File-by-File Breakdown

### 2.1. `apps/web/components/ui/media-upload/types.ts` (45 lines)
- Defines `UploadState` (`"idle" | "dragging" | "uploading" | "success" | "error"`).
- Defines `MediaUploadResult` contract (`url`, `r2Key`, `width`, `height`, `aspectRatio`, `fileSize`, `mediaType`).
- Defines `UniversalMediaUploadProps` contract (`label`, `value`, `onChange`, `placeholder`, `helperText`, `allowManualInput`, `folder`, `className`).
- Defines `MediaWorkerSuccessData` matching the Cloudflare Media Worker response schema.
- Exports mapper `toMediaResult` transforming snake_case worker payload to camelCase frontend result.

### 2.2. `apps/web/components/ui/media-upload/useMediaUpload.ts` (95 lines)
- Custom React hook managing upload state machine, errors, and results.
- `handleFileUpload(file: File | Blob, folder)`: validates $\le 10\text{MB}$, constructs `FormData`, sends `POST ${workerUrl}/upload?folder=...`, and parses result.
- `handleUrlFetch(url: string, folder)`: validates URL format, sends `POST ${workerUrl}/fetch-external` with JSON payload `{ url, folder }`.
- `handlePaste(e: React.ClipboardEvent, folder)`: detects image blobs in clipboard items or image URLs in text, routing them to the appropriate handler.
- `reset()`: resets upload state and clears errors.
- Every function is $\le 28$ lines.

### 2.3. `apps/web/components/ui/media-upload/MediaDropzoneView.tsx` (75 lines)
- Renders the interactive drag-and-drop zone with hidden file input.
- Decomposed into `DropzoneUploading`, `DropzoneIdle`, and `MediaDropzoneView` components (all $\le 28$ lines).
- Implements active dragging state feedback using Tailwind CSS v4 `border-(--accent-bronze) bg-(--accent-bronze)/10`.
- Displays file constraints (`JPG, PNG, WebP (Tối đa 10MB)`) and shortcut hint (`Ctrl + V`).

### 2.4. `apps/web/components/ui/media-upload/MediaPreviewCard.tsx` (79 lines)
- Renders the uploaded WebP image preview inside an `aspect-video` viewport.
- Sub-components `MediaMetaBadges` and `MediaActionButtons` keep function lengths under 25 lines.
- Displays metadata pill tags: dimensions (`1920 × 1080`), aspect ratio tag (`LANDSCAPE`), file size (`142 KB`), and format (`WebP • R2`).
- Actions: "Thay đổi" (triggers replace mode), "Xóa" (removes media), and "Xem gốc" (external link icon).

### 2.5. `apps/web/components/ui/media-upload/MediaUrlFetchBar.tsx` (64 lines)
- Compact input row allowing external URL input.
- Button "Nạp về R2" triggers server-to-server download and WebP compression on Cloudflare Media Worker.
- Supports manual bypass mode (`allowManualInput`): if input starts with `/` (e.g. `/image/projects/...`), button switches to "Áp dụng" for immediate local assignment.
- Sub-component `UrlSubmitBtn` keeps all functions $\le 34$ lines.

### 2.6. `apps/web/components/ui/media-upload/UniversalMediaUpload.tsx` (87 lines)
- Master coordinator component binding `useMediaUpload`, `MediaDropzoneView`, `MediaPreviewCard`, and `MediaUrlFetchBar`.
- Sub-components `UploadHeader`, `ErrorBanner`, and `DropzoneContainer` keep all functions $\le 31$ lines.
- Emits `onChange(url, metadata)` to parent form components.

### 2.7. `apps/web/components/ui/media-upload/index.ts` (7 lines)
- Facade barrel exporting `UniversalMediaUpload`, `useMediaUpload`, and all sub-components and types.

### 2.8. `apps/web/components/ui/ImageUrlInput.tsx` (41 lines)
- Refactored to wrap `UniversalMediaUpload` while preserving 100% of the existing props interface (`label`, `value`, `onChange`, `placeholder`, `helperText`, `allowFilePath`).
- Maps `allowFilePath` to `allowManualInput` on `UniversalMediaUpload`.
- Re-exports everything from `./media-upload` for backward compatibility across all call sites.

### 2.9. `apps/web/test-media-upload.mjs` (75 lines)
- Automated verification script checking:
  1. Line counts for all 8 `.ts`/`.tsx` files against custom dispatch limits and the $\le 100$ lines hard limit.
  2. Tailwind CSS v4 syntax compliance (asserts absence of banned v3 patterns like `[var(--...)]`, `border-white/[0.xx]`, `outline-none`).
  3. `toMediaResult` data contract transformation.
  4. Backward compatibility contract in `ImageUrlInput.tsx`.
  5. Barrel exports in `index.ts`.

---

## 3. Verification Commands & Results

| Check | Command | Result |
| :--- | :--- | :--- |
| **Line Counts & Tailwind v4 Test** | `node apps/web/test-media-upload.mjs` | **PASS (Exit 0)**: All 8 files pass line count constraints and Tailwind v4 checks |
| **TypeScript Typecheck** | `node ./node_modules/.pnpm/typescript@5.9.3/node_modules/typescript/bin/tsc --noEmit -p apps/web/tsconfig.json` | **PASS (Exit 0)**: 0 errors |
| **Next.js Production Build** | `cd apps/web; npx next build --webpack` | **PASS (Exit 0)**: 7/7 static pages generated successfully |
