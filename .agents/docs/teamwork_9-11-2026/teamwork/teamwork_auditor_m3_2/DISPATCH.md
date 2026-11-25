## 2026-11-08T07:32:54Z

# Assignment: Forensic Integrity Auditor for Milestone 3 Remediation (Admin UI Universal Media Dropzone)

## Context & Objectives
You are the Forensic Integrity Auditor for Milestone 3 Iteration 2.
In Iteration 1, you correctly issued an `INTEGRITY VIOLATION` veto because 4 functions exceeded the hard limit of 35 lines per function, and the test script used a local mock facade.
Worker 6 has executed a full remediation refactoring.
Your objective is to independently perform forensic static and dynamic analysis to determine whether the codebase is authentic, compliant with all architectural constraints, and completely clean of integrity violations.

## Authoritative Reference Documents (Read FIRST):
1. `ORIGINAL_REQUEST.md`: `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\ORIGINAL_REQUEST.md`
2. `PROJECT.md`: `e:\lap_trinh\Project\website\KhangVietDesign\source\PROJECT.md`
3. Explorer 7 Remediation Blueprint: `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_explorer_m3_remediation\handoff.md`
4. Worker 6 Completion Report: `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_worker_m3_remediation\handoff.md`

## Your State Folder:
`e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_auditor_m3_2`

## Forensic Audit Protocol:
1. **AST Function Length Analysis (Zero Tolerance)**:
   - Run independent AST analysis across all 9 UI/media files (`apps/web/components/ui/media-upload/*` and `ImageUrlInput.tsx`).
   - Every single function, method, arrow function, and enclosing function must be <= 35 lines.
   - Run `node .agents/teamwork/teamwork_auditor_m3_1/audit-check.mjs`.
2. **Absence of Mock Facades & Hardcoded Bypass**:
   - Inspect `apps/web/test-media-upload.mjs`: confirm no local dummy `function toMediaResult`, confirm dynamic transpile import of genuine source files.
   - Confirm genuine endpoints are invoked in `mediaUploadService.ts`.
3. **File Size Compliance**:
   - Every file must be <= 100 lines.
4. **Tailwind CSS v4 Compliance**:
   - Verify zero banned v3 syntax across all UI components.
5. **Independent Build Verification**:
   - Run `node ./node_modules/.pnpm/typescript@5.9.3/node_modules/typescript/bin/tsc --noEmit -p apps/web/tsconfig.json`
   - Run `cd apps/web; npx next build --webpack`

## Deliverables:
- Write `handoff.md` in your state folder with complete forensic evidence, AST measurements, and binary verdict: **`CLEAN`** or **`INTEGRITY VIOLATION`**.
- Send a completion message via `send_message` to orchestrator (`9875b955-8c1f-4348-971a-46ec427f4059`).
