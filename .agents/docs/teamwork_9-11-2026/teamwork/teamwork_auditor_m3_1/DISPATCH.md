# Dispatch: Forensic Auditor (Milestone 3 - Admin UI Media Dropzone Forensic Audit)

## Assigned Role
- Archetype: teamwork_auditor
- State folder: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_auditor_m3_1

## Objective
Perform forensic integrity auditing of Milestone 3 (`apps/web` Admin UI Universal Media Dropzone).
Verify that:
1. Every `.ts`/`.tsx` file in `apps/web/components/ui/media-upload/` and `ImageUrlInput.tsx` is <= 100 lines.
2. Every function/method is <= 35 lines.
3. No fake facades, mocks, or dummy implementations exist in production paths.
4. Tailwind CSS v4 syntax is strictly respected (no banned v3 patterns).
5. TypeScript check and Next.js production build pass cleanly.

## Mandatory Inputs to Read
1. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\ORIGINAL_REQUEST.md` (Read in full)
2. `e:\lap_trinh\Project\website\KhangVietDesign\source\PROJECT.md`
3. `e:\lap_trinh\Project\website\KhangVietDesign\source\TEST_INFRA.md`
4. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_worker_m3_1\changes.md`
5. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_worker_m3_1\handoff.md`
6. `.agents/rules/code-organization.md` (Hard limits: <= 100 lines/file, <= 35 lines/function)
7. `.agents/rules/tailwindcss-v4.md` (Tailwind CSS v4 syntax rules)

## Auditing Tasks
1. Run independent line count check on all `.ts`/`.tsx` files under `apps/web/components/ui/media-upload/` and `ImageUrlInput.tsx`.
2. Run independent function length AST check across all functions/methods.
3. Check for fake mocks/bypasses in `apps/web/components/ui/media-upload/`.
4. Check Tailwind CSS v4 compliance across all 8 files.
5. Run independent verification commands:
   - `node apps/web/test-media-upload.mjs`
   - `node ./node_modules/.pnpm/typescript@5.9.3/node_modules/typescript/bin/tsc --noEmit -p apps/web/tsconfig.json`
   - `cd apps/web; npx next build --webpack`
6. Write your forensic audit report to `handoff.md` in your state folder with an explicit binary verdict: `CLEAN` or `INTEGRITY VIOLATION`.


## 2026-11-08T06:51:48Z
You are Forensic Integrity Auditor evaluating Milestone 3 (`apps/web` Admin UI Universal Media Dropzone).
State folder: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_auditor_m3_1
Working directory: e:\lap_trinh\Project\website\KhangVietDesign\source

Read:
1. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\ORIGINAL_REQUEST.md` (MANDATORY: Read in full)
2. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_auditor_m3_1\DISPATCH.md`
3. `e:\lap_trinh\Project\website\KhangVietDesign\source\PROJECT.md`
4. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_worker_m3_1\changes.md`
5. `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_worker_m3_1\handoff.md`
6. `.agents/rules/code-organization.md` (Hard limits: <= 100 lines/file, <= 35 lines/function)
7. `.agents/rules/tailwindcss-v4.md` (Tailwind CSS v4 syntax rules)
