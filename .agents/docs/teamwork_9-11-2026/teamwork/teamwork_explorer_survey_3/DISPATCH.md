## 2026-11-08T03:58:22Z
You are Explorer 3: Admin UI & Frontend Explorer.

Your task is to conduct a thorough technical survey for Milestone 3 (Admin UI Universal Media Dropzone & Integration `apps/web`).

## Authoritative Inputs
- Read ORIGINAL_REQUEST.md at: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\ORIGINAL_REQUEST.md
- Read plan reference at: C:\Users\PC\.gemini\antigravity\brain\99ec1c47-997d-4231-a2f8-0bdeb0c8509b\database-architecture-redesign.md
- Working Directory: e:\lap_trinh\Project\website\KhangVietDesign\source
- Your State Folder: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_explorer_survey_3

## Scope of Investigation
1. Examine `apps/web`:
   - Inspect existing `ImageUrlInput.tsx`, `ProjectFormFields.tsx`, `ProjectGalleryRow.tsx`, and project management pages/modals in `apps/web`.
   - Check how bypass path or image URLs are currently handled and where they are saved.
   - Inspect how projects and gallery images are rendered in the public web app (e.g. project detail page, portfolio, home hero/featured projects).
   - Review Tailwind CSS v4 styling rules (`.agents/rules/tailwindcss-v4.md`) and code organization rules (`.agents/rules/code-organization.md`) to ensure full compliance.
2. Design `UniversalMediaUpload` component:
   - Must support 4 distinct input methods:
     a) Browse file (file picker dialog)
     b) Drag & Drop (interactive drop zone with visual drag-over state)
     c) Clipboard Paste (listen for `paste` event / Ctrl+V, extract image blob from `event.clipboardData.items`)
     d) External URL fetch (text input + fetch button to trigger Media Worker's URL import)
   - UI States: idle, dragging, uploading (with progress or spinner indicator), success (preview thumbnail, image dimensions, aspect ratio, file size), error (validation message, retry button).
   - Calling `apps/media-worker`: environment configuration (e.g., `NEXT_PUBLIC_MEDIA_WORKER_URL`), CORS considerations, direct client upload vs proxy.
3. Backward Compatibility & Data Transition:
   - How project forms handle both existing projects (with legacy cover_image / gallery JSON) and new 3NF normalized `project_media`.
   - Ensure no breaking changes on the live user-facing pages (`apps/web`) when displaying projects.
4. Build & Lint:
   - Check build command: `pnpm --filter web build` and ensure TypeScript types align with `@khangviet/types`.

## Output Deliverables
- Write detailed findings to `analysis.md` in your state folder.
- Write a structured handoff to `handoff.md` in your state folder following the Handoff Protocol.
- Notify the orchestrator via `send_message` with report paths and key conclusions when done. Do not modify source code or write non-metadata files.
