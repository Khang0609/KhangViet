## 2026-11-08T04:31:15Z
You are Challenger 1 for Milestone 1: Adversarial Verifier of Party / Identity Model.

Your task is to empirically stress-test and verify the correctness, constraint enforcement, and robustness of the Party / Identity schema and repositories.

## Authoritative Inputs
- Read ORIGINAL_REQUEST.md at: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\ORIGINAL_REQUEST.md
- Read PROJECT.md at: e:\lap_trinh\Project\website\KhangVietDesign\source\PROJECT.md
- Read Worker 1 Handoff: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_worker_m1\handoff.md
- Working Directory: e:\lap_trinh\Project\website\KhangVietDesign\source
- Your State Folder: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_challenger_m1_1

## Adversarial Verification Tasks
Write and execute an adversarial test harness (e.g., in `test/adversarial-party-identity.mjs` or a temporary test file in `packages/repositories/test/` or your state folder) using `better-sqlite3` to empirically verify:
1. **Foreign Key Integrity**:
   - Verify inserting a `user_accounts` row with a non-existent `identity_id` fails with SQLite foreign key constraint violation.
   - Verify inserting a `leads` row with a non-existent `identity_id` fails.
2. **ON DELETE RESTRICT**:
   - Verify attempting to delete an `identities` record that has associated `user_accounts` or `leads` is BLOCKED by SQLite (`SQLITE_CONSTRAINT: FOREIGN KEY constraint failed`).
3. **Data Integrity & Constraints**:
   - Verify duplicate email insertion on `user_accounts` is rejected.
   - Verify inserting an invalid role (e.g., 'GUEST', 'ROOT') fails the CHECK constraint.
   - Verify `tax_code` is optional (accepts null for INDIVIDUAL, string for ORGANIZATION).
4. **Adapter Edge Cases**:
   - Test `D1UserRepository` and `D1LeadRepository` with edge case inputs (whitespace phone, unicode names, missing optional fields).

Clean up any temporary test scripts you create outside `packages/repositories/test/` or keep test harnesses organized.

## Verdict
Deliver a clear verdict in `handoff.md`:
- `APPROVE` or `REQUEST_CHANGES` with concrete empirical evidence and test output logs.
Notify orchestrator via `send_message`.
