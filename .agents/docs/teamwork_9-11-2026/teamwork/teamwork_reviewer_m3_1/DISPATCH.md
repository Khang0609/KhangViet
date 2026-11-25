# Dispatch: Reviewer (Milestone 3 - Admin UI Media Dropzone Review)

## Assigned Role
- Archetype: teamwork_reviewer
- State folder: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_reviewer_m3_1

## Objective
Independently review the newly implemented `UniversalMediaUpload` component and modular sub-components under `apps/web/components/ui/media-upload/` and `apps/web/components/ui/ImageUrlInput.tsx`.
Verify architectural soundness, Tailwind CSS v4 compliance, backward compatibility, and strict line count constraints.

## Mandatory Inputs to Read
1. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\ORIGINAL_REQUEST.md` (Read in full)
2. `e:\lap_trinh\Project\website\KhangVietDesign\source\PROJECT.md`
3. `e:\lap_trinh\Project\website\KhangVietDesign\source\TEST_INFRA.md`
4. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_worker_m3_1\changes.md`
5. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_worker_m3_1\handoff.md`
6. `.agents/rules/code-organization.md` (Hard limits: <= 100 lines/file, <= 35 lines/function)
7. `.agents/rules/tailwindcss-v4.md` (Tailwind CSS v4 syntax rules)
8. Source files under `apps/web/components/ui/`:
   - `media-upload/types.ts`
   - `media-upload/useMediaUpload.ts`
   - `media-upload/MediaDropzoneView.tsx`
   - `media-upload/MediaPreviewCard.tsx`
   - `media-upload/MediaUrlFetchBar.tsx`
   - `media-upload/UniversalMediaUpload.tsx`
   - `media-upload/index.ts`
   - `ImageUrlInput.tsx`

## Review Tasks
1. Run verification commands:
   - `node apps/web/test-media-upload.mjs`
   - `node ./node_modules/.pnpm/typescript@5.9.3/node_modules/typescript/bin/tsc --noEmit -p apps/web/tsconfig.json`
   - `cd apps/web; npx next build --webpack`
2. Audit line counts: every file <= 100 lines, every function <= 35 lines.
3. Verify Tailwind CSS v4 syntax: assert no `[var(--...)]`, no `border-white/[0.xx]`, no `outline-none`.
4. Verify backward compatibility: verify `ImageUrlInput.tsx` wraps `UniversalMediaUpload` and does not break existing usages in `ProjectFormFields.tsx`, `ProjectGalleryRow.tsx`, `HeroSlideItem.tsx`.
5. Output explicit verdict `APPROVE` or `REQUEST_CHANGES` in `handoff.md` in your state folder.


## 2026-11-08T06:51:36Z
[Message] sender=9875b955-8c1f-4348-971a-46ec427f4059 priority=MESSAGE_PRIORITY_HIGH
You are Reviewer evaluating Milestone 3 (`apps/web` Admin UI Universal Media Dropzone).
State folder: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_reviewer_m3_1
Working directory: e:\lap_trinh\Project\website\KhangVietDesign\source
