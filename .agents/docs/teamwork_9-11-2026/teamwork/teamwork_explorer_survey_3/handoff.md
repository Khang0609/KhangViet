# Handoff Report: Milestone 3 (Admin UI Universal Media Dropzone & Integration `apps/web`)

**Agent**: Explorer 3 (Admin UI & Frontend Explorer)  
**Date**: 2026-11-08  
**Report Type**: Hard Handoff (Investigation Complete)  
**State Folder**: `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_explorer_survey_3`

---

## 1. Observation

1. **`ImageUrlInput.tsx` Implementation**:
   - Location: `apps/web/components/ui/ImageUrlInput.tsx` (87 lines).
   - Lines 33–37 display `[File Path Bypass: ON]` when `allowFilePath` is true:
     ```tsx
     {allowFilePath && (
       <span className="font-mono-tech text-[10px] text-(--accent-bronze)">
         [File Path Bypass: ON]
       </span>
     )}
     ```
   - Lines 57–64 contain a static placeholder informing:
     *"Tính năng gắn tệp ảnh từ máy tính (Cloud Storage) sẽ được kích hoạt ở giai đoạn tiếp theo."*
   - It only takes raw string URLs/paths into an `<input>` element with a minimal 40x56px image preview, without any drag-drop, file upload, clipboard paste, or server URL fetching.

2. **Call Sites in Admin UI**:
   - `apps/web/components/modules/admin/projects/ProjectFormFields.tsx:67`:
     `<ImageUrlInput label="Ảnh Bìa Dự Án (Cover Image)" value={data.coverImage} onChange={(url) => onChange("coverImage", url)} />`
   - `apps/web/components/modules/admin/projects/ProjectGalleryRow.tsx:33`:
     `<ImageUrlInput label="Đường dẫn ảnh" value={item.src} onChange={(url) => onUpdate(index, "src", url)} allowFilePath={allowFilePath} />`
   - `apps/web/components/modules/admin/hero/HeroSlideItem.tsx:60`:
     `<ImageUrlInput label="URL Ảnh Nền (Background Image)" value={slide.image} onChange={(url) => onChange(index, "image", url)} />`
   - `apps/web/components/index.ts:7`:
     `export * from "./ui/ImageUrlInput";`

3. **Public Presentation Components**:
   - `apps/web/components/modules/project-showcase/ProjectShowcaseGallery.tsx:26-30`:
     `<img src={project.coverImage} alt={project.title} className="h-full w-full object-cover ..." />`
   - `apps/web/components/modules/project-showcase/ProjectShowcaseGallery.tsx:48-52`:
     `<img src={image.src} alt={image.caption} className="h-full w-full object-cover ..." />`
   - `apps/web/components/modals/project-lightbox/ProjectGalleryViewer.tsx:26-30`:
     `<img src={currentItem.src} alt={currentItem.caption} className="max-h-[56vh] w-auto ... object-contain" />`
   - None of the public components use Next.js `<Image>` with strict domain restrictions (`remotePatterns`); all use native `<img>` tags that transparently render both local static files (`/image/projects/...`) and remote CDN URLs (`https://media.khangviet.vn/...`).

4. **Monorepo Contracts & Types**:
   - `packages/types/src/project.ts`:
     - `ProjectGalleryItemSchema`: `{ id, src, caption, location, spec, aspect }`
     - `FeaturedProjectSchema`: `{ id, code, title, subtitle, client, locations, year, categoryTag, scaleMetric, materials, engineeringNotes, summary, coverImage, gallery }`
   - `apps/web` consumes `@khangviet/types` directly.

5. **Build & Typecheck Results**:
   - `pnpm --filter web exec tsc --noEmit` exited with code 0 (zero type errors).
   - `pnpm --filter web build` (`next build --webpack`) exited with code 0. Generated 7 static pages in 7.3s.
   - `pnpm --filter web lint` identified 4 pre-existing ESLint issues in modal components (`SpecAndProfileModal.tsx:22`, `CorporateProfileTab.tsx:54`, `BaseModal.tsx:22`) unrelated to image inputs.

---

## 2. Logic Chain

1. **Direct R2 Client Upload is the Optimal Architecture**:
   - *From Observation 1 & 2*: Currently, the admin user manually enters static file paths or external image URLs because no storage service was linked.
   - *From Architecture Survey (Milestone 2)*: `apps/media-worker` runs on Cloudflare Workers with direct `MEDIA_BUCKET` R2 binding and WebP conversion capability.
   - *Reasoning*: Routing heavy file uploads through `apps/api` would risk exceeding the 128MB worker RAM limit and adding double network latency. Therefore, `UniversalMediaUpload` must perform **direct client uploads** to `NEXT_PUBLIC_MEDIA_WORKER_URL` (`POST /upload` for multipart/blob and `POST /fetch-external` for remote URLs).

2. **Component Modularization to Satisfy Hard Constraints**:
   - *From Observation 1 & Code Rules (`.agents/rules/code-organization.md`)*: Rule requires file length $\le 100$ lines and function length $\le 35$ lines.
   - A single component handling Browse file, Drag & Drop, Clipboard Paste, URL fetch, and UI preview with progress states would exceed 250 lines if written as a monolithic file.
   - *Reasoning*: The component must be decomposed into a modular directory `apps/web/components/ui/media-upload/`:
     - `useMediaUpload.ts`: state machine, upload handlers, paste listener ($\approx 90$ lines).
     - `MediaDropzoneView.tsx`: interactive drag/drop and browse file dialog ($\approx 85$ lines).
     - `MediaPreviewCard.tsx`: thumbnail, dimension/size pills, remove/replace buttons ($\approx 75$ lines).
     - `MediaUrlFetchBar.tsx`: external URL input and fetch trigger ($\approx 65$ lines).
     - `types.ts`: interface and state definitions ($\approx 40$ lines).
     - `UniversalMediaUpload.tsx`: coordinator facade ($\approx 90$ lines).
     - `ImageUrlInput.tsx`: backward-compatible wrapper.

3. **100% Backward Compatibility with Zero Public Regressions**:
   - *From Observation 3 & 4*: The public components consume `project.coverImage: string` and `project.gallery[].src: string`.
   - The API layer in Milestone 1 is normalizing `gallery` into `project_media` rows in D1, but continues serving `FeaturedProject` to the frontend with `coverImage` and `gallery: ProjectGalleryItem[]`.
   - Because `<img>` renders relative paths (`/image/...`) and absolute URLs (`https://...`) identically, existing database projects and static mock projects remain completely functional on the public website with zero code changes required in `ProjectShowcase`, `ProjectLightboxModal`, or `HeroSection`.

---

## 3. Caveats

1. **Pre-existing ESLint Warnings/Errors in Modal Components**:
   - `apps/web/components/modals/SpecAndProfileModal.tsx`, `CorporateProfileTab.tsx`, and `BaseModal.tsx` have pre-existing lint warnings/errors in the new Next.js 16 / React 19 ESLint configuration. While `next build` ignores them and succeeds, these should be addressed to achieve a 100% clean `pnpm --filter web lint`.
2. **CORS Requirement for `apps/media-worker`**:
   - Because `apps/web` uploads directly from the browser (e.g. `localhost:3000` or `khangviet.vn`) to `apps/media-worker` (e.g. `127.0.0.1:8788` or `media.khangviet.vn`), the Media Worker must explicitly configure CORS headers (`Access-Control-Allow-Origin: *` or whitelisted origins, `Access-Control-Allow-Methods: POST, OPTIONS`).
3. **Environment Variable Provisioning**:
   - `NEXT_PUBLIC_MEDIA_WORKER_URL` must be added to `apps/web/.env.example` and `apps/web/.env.local` (defaulting to `http://127.0.0.1:8788`).

---

## 4. Conclusion

1. **Viability**: Upgrading `ImageUrlInput` to `UniversalMediaUpload` in `apps/web` is fully feasible, well-scoped, and introduces zero breaking changes to existing data structures or public web pages.
2. **Input Support**: All 4 requested input modes (Browse file, Drag & Drop, Clipboard Paste `Ctrl+V`, External URL fetch) can be implemented cleanly with full Tailwind CSS v4 styling and strict code limits ($\le 100$ lines/file).
3. **Architecture**: Direct browser-to-Media-Worker uploading is strongly recommended.
4. **Transition**: Both legacy relative paths and new Cloudflare R2 WebP URLs coexist seamlessly in `apps/web`.

---

## 5. Verification Method

1. **TypeScript Typecheck**:
   ```bash
   pnpm --filter web exec tsc --noEmit
   ```
   *Expected Result*: 0 errors.

2. **Next.js Production Build**:
   ```bash
   # On Windows PowerShell, clean .next first if permission lock exists:
   Remove-Item -Path "apps/web/.next" -Recurse -Force -ErrorAction SilentlyContinue
   pnpm --filter web build
   ```
   *Expected Result*: Successful compilation with code 0 and generation of all 7 static/dynamic routes (`/`, `/admin`, `/login`, `/api/revalidate`).

3. **Code Compliance Spot-Check**:
   - Inspect files under `apps/web/components/ui/media-upload/` to verify line counts do not exceed 100 lines.
   - Inspect Tailwind classes to verify v4 syntax: `bg-(--accent-bronze)`, `border-white/8`, `aspect-video`.

4. **Invalidation Conditions**:
   - Failure of `pnpm --filter web build`.
   - Broken image rendering on public homepage (`http://localhost:3000`).
