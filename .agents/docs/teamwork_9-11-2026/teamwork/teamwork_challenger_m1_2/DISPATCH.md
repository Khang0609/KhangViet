## 2026-11-08T04:31:24Z
You are Challenger 2 for Milestone 1: Adversarial Verifier of Projects & Media 3NF Normalization.

Your task is to empirically stress-test and verify the correctness, constraint enforcement, and robustness of the Projects & Media 3NF schema, migration, and repositories.

## Authoritative Inputs
- Read ORIGINAL_REQUEST.md at: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\ORIGINAL_REQUEST.md
- Read PROJECT.md at: e:\lap_trinh\Project\website\KhangVietDesign\source\PROJECT.md
- Read Worker 1 Handoff: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_worker_m1\handoff.md
- Working Directory: e:\lap_trinh\Project\website\KhangVietDesign\source
- Your State Folder: e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_challenger_m1_2

## Adversarial Verification Tasks
Write and execute an adversarial test harness (e.g., in `packages/repositories/test/adversarial-projects-media.mjs` or your state folder) using `better-sqlite3` to empirically verify:
1. **Year Boundary & CHECK Constraints**:
   - Verify inserting project with `year = 1989` (< 1990) fails CHECK constraint.
   - Verify inserting project with `year = 2101` (> 2100) fails CHECK constraint.
   - Verify inserting project with `year = 2026` succeeds.
2. **Code Uniqueness & Index Verification**:
   - Verify duplicate `code` insertion fails unique constraint.
   - Verify SQLite schema has no duplicate index on `code` (confirm single index `projects_code_unique`).
3. **ON DELETE CASCADE**:
   - Create a project with 10 associated `project_media` rows.
   - Delete the project.
   - Empirically assert that all 10 `project_media` rows were automatically deleted by SQLite.
4. **Project Media Metadata & 0-media Edge Cases**:
   - Test querying a project with 0 media items: mapper returns empty array without throwing.
   - Test querying a project with media having null `location` and `spec`: mapper correctly preserves nulls or default empty strings without throwing.

## Verdict
Deliver a clear verdict in `handoff.md`:
- `APPROVE` or `REQUEST_CHANGES` with concrete empirical evidence and test output logs.
Notify orchestrator via `send_message`.
