# Dispatch: Worker 5 (Milestone 3 - Admin UI Universal Media Dropzone Engineer)

## Mandatory Integrity Warning
> DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Assigned Role
- Archetype: teamwork_worker
- State folder: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_worker_m3_1
- Write ownership: Strictly within `apps/web/components/ui/media-upload/`, `apps/web/components/ui/ImageUrlInput.tsx`, and test verification scripts.

## Mandatory Inputs to Read
1. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\ORIGINAL_REQUEST.md` (Read in full)
2. `e:\lap_trinh\Project\website\KhangVietDesign\source\PROJECT.md`
3. `e:\lap_trinh\Project\website\KhangVietDesign\source\TEST_INFRA.md`
4. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_explorer_survey_3\analysis.md` (Authoritative Blueprint for M3)
5. `.agents/rules/code-organization.md` (Hard limits: <= 100 lines/file, <= 35 lines/function)
6. `.agents/rules/tailwindcss-v4.md` (Tailwind CSS v4 syntax: `bg-(--accent-bronze)`, `border-white/8`, `aspect-video`, `focus:outline-hidden`)

## Concrete Implementation Tasks

### 1. Create Modular Directory `apps/web/components/ui/media-upload/`
Create the following modular components adhering to <= 100 lines/file and <= 35 lines/function:
- `types.ts` (<= 45 lines):
  Export `UploadState` ("idle" | "dragging" | "uploading" | "success" | "error"), `MediaUploadResult` (url, r2Key, width, height, aspectRatio, fileSize, mediaType), and `UniversalMediaUploadProps`.
- `useMediaUpload.ts` (<= 95 lines):
  Upload hook managing state machine (`uploadState`, `progress`, `error`, `result`).
  Provides `handleFileUpload(file: File | Blob)` targeting `${process.env.NEXT_PUBLIC_MEDIA_WORKER_URL || "http://127.0.0.1:8788"}/upload`.
  Provides `handleUrlFetch(url: string)` targeting `/fetch-external`.
  Provides `handlePaste(e: React.ClipboardEvent)` detecting image blob or image URL text in clipboard.
  Provides `reset()`.
- `MediaDropzoneView.tsx` (<= 85 lines):
  Drag-and-drop zone (`onDragOver`, `onDragLeave`, `onDrop`), file picker button (`Chọn tệp`), keyboard shortcut indicator (`Ctrl+V`), and drag visual state.
- `MediaPreviewCard.tsx` (<= 80 lines):
  Thumbnail preview, metadata pill tags (dimensions, aspect ratio tag, file size, WebP), "Thay đổi" (Replace) and "Xóa" (Remove) buttons.
- `MediaUrlFetchBar.tsx` (<= 65 lines):
  Collapsible or inline input for external URL + "Nạp về R2" button.
- `UniversalMediaUpload.tsx` (<= 90 lines):
  Coordinator component combining `MediaDropzoneView`, `MediaPreviewCard`, `MediaUrlFetchBar`, wiring `onChange(url, metadata)`.
- `index.ts` (<= 15 lines):
  Facade exporting `UniversalMediaUpload` and types.

### 2. Backward Compatibility in `apps/web/components/ui/ImageUrlInput.tsx`
- Refactor `ImageUrlInput.tsx` (<= 80 lines) to wrap `UniversalMediaUpload` while maintaining the exact existing props signature (`label`, `value`, `onChange`, `placeholder`, `helperText`, `allowFilePath`).
- Ensure all existing usages in `ProjectFormFields.tsx`, `ProjectGalleryRow.tsx`, `HeroSlideItem.tsx` continue to work with zero breaking changes.

### 3. Verification & Testing
1. Verify Tailwind CSS v4 syntax compliance:
   - Check that no v3 syntax (`[var(--...)]`, `border-white/[0.08]`, `outline-none`) is used.
2. Verify TypeScript typecheck:
   `node ./node_modules/.pnpm/typescript@5.9.3/node_modules/typescript/bin/tsc --noEmit -p apps/web/tsconfig.json`
3. Verify Next.js production build:
   `pnpm --filter web build` (or `node apps/web/node_modules/next/dist/bin/next build apps/web`)
4. Create an automated test / verification script (e.g. `apps/web/test-media-upload.mjs`) verifying:
   - Component exports and prop contracts.
   - Upload URL construction and payload formatting for multipart and JSON external fetch.
   - Backward compatibility wrapper functionality.
5. Verify line count limits: all files <= 100 lines and all functions <= 35 lines.

## Deliverables
- `changes.md` in your state folder.
- `handoff.md` in your state folder with complete 5 components: Observation, Logic Chain, Caveats, Conclusion, Verification Method.
- Send completion message to parent when done.


## 2026-11-08T06:39:13Z
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

You are Worker 5 implementing Milestone 3: Admin UI Universal Media Dropzone for `apps/web`.
State folder: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_worker_m3_1
Working directory: e:\lap_trinh\Project\website\KhangVietDesign\source
