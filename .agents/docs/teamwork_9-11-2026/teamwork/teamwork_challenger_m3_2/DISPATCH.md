## 2026-11-08T07:32:42Z

# Assignment: Challenger for Milestone 3 Remediation (Admin UI Universal Media Dropzone Stress Testing)

## Context & Objectives
You are the Challenger for Milestone 3 Iteration 2.
Worker 6 has refactored the Admin UI Universal Media Dropzone in `apps/web`.
Your objective is to adversarially and empirically stress-test the implementation, verify all edge cases (file limits, invalid inputs, paste handling, state transitions, backward compatibility), run the verification suites, and issue an authoritative verdict (`APPROVE` or `REQUEST_CHANGES`).

## Authoritative Reference Documents (Read FIRST):
1. `ORIGINAL_REQUEST.md`: `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\ORIGINAL_REQUEST.md`
2. `PROJECT.md`: `e:\lap_trinh\Project\website\KhangVietDesign\source\PROJECT.md`
3. Explorer 7 Remediation Blueprint: `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_explorer_m3_remediation\handoff.md`
4. Worker 6 Completion Report: `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_worker_m3_remediation\handoff.md`

## Your State Folder:
`e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_challenger_m3_2`

## Challenger Verification Criteria:
1. **Adversarial Stress Test Suite**:
   - Run `node apps/web/test-stress-dropzone.mjs`.
   - Verify that all 22 tests across 8 suites pass (including Suite 8.2 which previously failed on `useMediaUpload` lines).
2. **Edge Cases & Failure Recovery**:
   - File size > 10MB rejection.
   - Non-http URL rejection.
   - Preserved input on fetch error.
   - Target filtering on paste events.
   - Replace & Remove workflows.
   - File path bypass mode (`allowManualInput` / `allowFilePath`).
3. **Execution Verification**:
   - `node apps/web/test-media-upload.mjs`
   - `node apps/web/test-stress-dropzone.mjs`
   - `node ./node_modules/.pnpm/typescript@5.9.3/node_modules/typescript/bin/tsc --noEmit -p apps/web/tsconfig.json`

## Deliverables:
- Write `handoff.md` in your state folder with complete stress-testing results, empirical observations, and explicit verdict: `APPROVE` or `REQUEST_CHANGES`.
- Send a completion message via `send_message` to orchestrator (`9875b955-8c1f-4348-971a-46ec427f4059`).
