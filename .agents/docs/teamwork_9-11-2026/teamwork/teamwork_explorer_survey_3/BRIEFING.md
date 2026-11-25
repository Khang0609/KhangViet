# BRIEFING — 2026-11-08T04:10:00Z

## Mission
Conduct a thorough technical survey for Milestone 3: Admin UI Universal Media Dropzone & Integration in `apps/web`.

## 🔒 My Identity
- Archetype: explorer
- Roles: Read-only investigation: analyze problems, synthesize findings, produce structured reports
- Working directory: e:\lap_trinh\Project\website\KhangVietDesign\source
- State folder: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_explorer_survey_3
- Original parent: 9875b955-8c1f-4348-971a-46ec427f4059
- Milestone: Milestone 3 - Admin UI Universal Media Dropzone & Integration `apps/web`

## 🔒 Key Constraints
- Read-only investigation — do NOT implement or modify project source code
- Only write metadata and report files in `.agents/teamwork/teamwork_explorer_survey_3/`
- Full compliance with Tailwind CSS v4 rules and Code Organization rules (<=100 lines/file, <=35 lines/function)
- Handoff report must follow 5-component structure (Observation, Logic Chain, Caveats, Conclusion, Verification Method)

## Current Parent
- Conversation ID: 9875b955-8c1f-4348-971a-46ec427f4059
- Updated: 2026-11-08T04:10:00Z

## Investigation State
- **Explored paths**:
  - `apps/web/components/ui/ImageUrlInput.tsx`
  - `apps/web/components/modules/admin/projects/ProjectFormFields.tsx`
  - `apps/web/components/modules/admin/projects/ProjectGalleryRow.tsx`
  - `apps/web/components/modules/admin/projects/ProjectGalleryField.tsx`
  - `apps/web/components/modules/admin/projects/ProjectFormModal.tsx`
  - `apps/web/components/modules/admin/projects/ProjectCardItem.tsx`
  - `apps/web/components/modules/admin/projects/ProjectListView.tsx`
  - `apps/web/components/modules/admin/hero/HeroSlideItem.tsx`
  - `apps/web/components/modules/project-showcase/ProjectShowcaseGallery.tsx`
  - `apps/web/components/modals/project-lightbox/ProjectGalleryViewer.tsx`
  - `apps/web/data/khangVietData.ts`
  - `apps/web/app/globals.css`
  - `apps/web/.env.example` & `.env.local`
- **Key findings**:
  - `ImageUrlInput` currently relies on static file path bypass `[File Path Bypass: ON]`.
  - Public rendering uses standard `<img>` tags, allowing seamless coexistence of local `/image/...` paths and R2 CDN `https://...` URLs without breaking public pages.
  - Recommended `UniversalMediaUpload` modularization into 6 subcomponents under `apps/web/components/ui/media-upload/` to strictly comply with the $\le 100$ lines rule.
  - Direct browser-to-Media-Worker uploading is chosen over proxying through `apps/api` to respect worker memory constraints and reduce upload latency.
  - `pnpm --filter web exec tsc --noEmit` and `pnpm --filter web build` both pass with zero errors.
- **Unexplored areas**: None within Milestone 3 scope.

## Key Decisions Made
- Decompose `UniversalMediaUpload` into `useMediaUpload.ts`, `MediaDropzoneView.tsx`, `MediaPreviewCard.tsx`, `MediaUrlFetchBar.tsx`, `types.ts`, and `UniversalMediaUpload.tsx`.
- Keep `ImageUrlInput.tsx` as a backward-compatible adapter wrapping `UniversalMediaUpload`.
- Direct client upload to `NEXT_PUBLIC_MEDIA_WORKER_URL`.

## Artifact Index
- `.agents/teamwork/teamwork_explorer_survey_3/DISPATCH.md` — Initial dispatch message
- `.agents/teamwork/teamwork_explorer_survey_3/BRIEFING.md` — Agent briefing & situational awareness
- `.agents/teamwork/teamwork_explorer_survey_3/progress.md` — Liveness & progress tracker
- `.agents/teamwork/teamwork_explorer_survey_3/analysis.md` — Detailed technical survey and design report
- `.agents/teamwork/teamwork_explorer_survey_3/handoff.md` — 5-component hard handoff report
