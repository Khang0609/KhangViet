## 2026-11-08T07:32:34Z
# Assignment: Reviewer for Milestone 3 Remediation (Admin UI Universal Media Dropzone & AST Compliance)

## Context & Objectives
You are the Reviewer for Milestone 3 Iteration 2.
Worker 6 has refactored the Admin UI Universal Media Dropzone in `apps/web` to resolve the 4 function length violations from Iteration 1 and eliminate the test script mock facade.
Your objective is to independently review the implementation, verify code organization and architectural conformance, run the build and test suites, and issue an authoritative verdict (`APPROVE` or `REQUEST_CHANGES`).

## Authoritative Reference Documents (Read FIRST):
1. `ORIGINAL_REQUEST.md`: `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\ORIGINAL_REQUEST.md`
2. `PROJECT.md`: `e:\lap_trinh\Project\website\KhangVietDesign\source\PROJECT.md`
3. Explorer 7 Remediation Blueprint: `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_explorer_m3_remediation\handoff.md`
4. Worker 6 Completion Report: `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_worker_m3_remediation\handoff.md`

## Your State Folder:
`e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_reviewer_m3_2`

## Review Verification Criteria:
1. **Code Organization & Hard Limits**:
   - Every file in `apps/web/components/ui/media-upload/` and `ImageUrlInput.tsx` must be <= 100 lines.
   - Every function (including nested functions in callbacks) must be <= 35 lines.
   - Verify `mediaUploadService.ts` cleanly encapsulates network calls.
2. **Tailwind CSS v4 Compliance**:
   - Strictly check for modern v4 tokens (`bg-(--accent-bronze)`, `border-white/8`, `aspect-video`, `focus:outline-hidden`).
   - Confirm NO legacy v3 patterns (`[var(--...)]`, `outline-none`, `aspect-[...]`).
3. **UX & Robustness Fixes**:
   - In `MediaUrlFetchBar.tsx`: user input URL is not cleared prematurely on network errors.
   - In `UniversalMediaUpload.tsx`: paste event is not hijacked when focus is inside a text input.
4. **Backward Compatibility**:
   - `ImageUrlInput.tsx` remains 100% compatible with existing consumers (`ProjectFormFields.tsx`, `HeroSlideItem.tsx`).
5. **Mandatory Execution Verification**:
   - `node apps/web/test-media-upload.mjs`
   - `node apps/web/test-stress-dropzone.mjs`
   - `node ./node_modules/.pnpm/typescript@5.9.3/node_modules/typescript/bin/tsc --noEmit -p apps/web/tsconfig.json`
   - `cd apps/web; npx next build --webpack`

## Deliverables:
- Write `handoff.md` in your state folder with complete review findings, verification command outputs, and explicit verdict: `APPROVE` or `REQUEST_CHANGES`.
- Send a completion message via `send_message` to orchestrator (`9875b955-8c1f-4348-971a-46ec427f4059`).
