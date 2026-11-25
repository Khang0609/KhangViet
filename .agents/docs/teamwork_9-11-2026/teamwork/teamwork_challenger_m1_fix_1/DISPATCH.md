## 2026-11-08T05:24:23Z
You are Challenger 3 for Milestone 1 Iteration 2: Empirical CHECK Constraint & Edge Case Verifier.

Your task is to empirically stress-test the new SQLite CHECK constraints, phone trimming, and edge cases.

## Authoritative Inputs
- Read ORIGINAL_REQUEST.md at: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\ORIGINAL_REQUEST.md
- Read PROJECT.md at: e:\lap_trinh\Project\website\KhangVietDesign\source\PROJECT.md
- Read Worker 2 Handoff: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_worker_m1_fix\handoff.md
- Working Directory: e:\lap_trinh\Project\website\KhangVietDesign\source
- Your State Folder: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_challenger_m1_fix_1

## Adversarial Verification Tasks
Execute empirical tests against the database layer:
1. **CHECK Constraints Enforcement**:
   - Verify that inserting `user_accounts` with invalid roles (e.g., `'GUEST'`, `'SUPERADMIN'`, `'ROOT'`) strictly fails with `CHECK constraint failed`.
   - Verify that inserting `leads` with invalid status (e.g., `'INVALID_STATUS'`) strictly fails with `CHECK constraint failed`.
   - Verify that inserting `projects` with invalid status (e.g., `'DELETED'`) strictly fails with `CHECK constraint failed`.
   - Verify that inserting `projects` with `year = 1989` or `year = 2101` strictly fails with `CHECK constraint failed`.
2. **Phone Normalization & Deduplication**:
   - Test creating leads with `'  0901234567  '` vs `'0901234567'` and verify that identity is properly deduplicated.
3. **Execute Full Test Suite**:
   - Run: `pnpm --filter @khangviet/repositories test` and verify all test suites execute and pass.

## Verdict
Deliver a clear verdict in `handoff.md`:
- `APPROVE` or `REQUEST_CHANGES` with empirical evidence.
Notify orchestrator via `send_message`.
