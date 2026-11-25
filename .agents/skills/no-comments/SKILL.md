---
name: no-comments
description: "Audit and strip needless comments, commented-out code, workaround sermons, and unsafe lint/type suppressions from the current diff, then fix root causes."
---

# No Comments

Audit the current diff against `main` (or the caller's scoped files) and eliminate comment clutter and unsafe suppressions.

## Steps

1. Spawn a `research` subagent via `invoke_subagent` (`TypeName: "research"`) with the scope and this brief:
   > Audit all comments and lint/TS suppressions (`eslint-disable`, `@ts-ignore`, `@ts-expect-error`) in the scoped diff. Kill narration, banners, commented-out corpses, and workaround alibis. Keep only: (a) legal/license headers, (b) non-obvious external platform/vendor constraints, (c) public API JSDoc contracts, or (d) issue/RFC links for constraints code cannot express. For every surprise in our own code or correctness/safety suppression, mark the exact symbol `MUST KILL` for rename, extract, type, or rearchitecture. Report touched files, line numbers, `MUST KILL` flags, and keeps.
2. Inspect the report. Reject any keep that lacks a proven external constraint, and reject any flag that misreads intentional code.
3. For trivial accepted flags, delete the dead comment/path or rename the symbol so the code is self-explanatory. If a `MUST KILL` requires reshaping types or boundaries, run the **architect** skill first.
4. Implement the smallest root-cause fix in scope. Never replace a deleted comment with a shorter alibi.
5. Report deletion count, `MUST KILL` fixes applied, and any remaining open constraints.
