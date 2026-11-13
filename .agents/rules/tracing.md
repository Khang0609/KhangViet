# Tracing, Error Boundaries & Atomic Execution

Standards for resilient error handling, observability, context fencing, and disciplined commits.

---

## 1. Error Handling (Strict Result Pattern)

Do not `throw` errors for expected business/domain failures. Reserve exceptions for unrecoverable system errors.

- **Explicit `Result<T, E>`:** Domain services and use-cases should return a discriminated union:
  ```ts
  export type Result<T, E = Error> =
    | { success: true; data: T }
    | { success: false; error: E };
  ```
- **Typed Domain Errors:** Define explicit error codes (e.g. `OUT_OF_STOCK`, `UNAUTHORIZED`) so callers/UI can handle them deterministically.
- **UI Error Boundaries:** Wrap independent feature modules in local Error Boundaries with a retryable fallback UI.

---

## 2. Structured Logging & Tracing Context

- **No Raw `console.log`:** Use the project's structured logger wrapper.
- **Context Payload:** Always attach structured metadata (`traceId` / `requestId`, entity IDs, error code, latency) across Controller → Service → Repository/Job boundaries.
- **Zero Secrets/PII in Logs:** Never log passwords, JWTs, cookies, API keys, or sensitive personal data.

---

## 3. AI Context Fence

1. **No Unsolicited Dependencies:** Never add packages to `package.json` without explicit user approval. Prefer native APIs or existing workspace packages.
2. **No Contract Guessing:** If an API/DB schema is ambiguous, stop and clarify before implementing.
3. **Style Consistency:** Do not mix `async/await` with raw `.then()/.catch()`, and preserve the target module's existing paradigm.

---

## 4. Atomic Execution & Large-Feature Commit Discipline

### 4.1. Incremental Workflow (For Medium/Large Features)
1. **Contracts & Types:** Define Zod schemas, DTOs, and types first (pause for confirmation if changing shared/public contracts).
2. **Pure Domain Logic:** Implement core logic with `Result<T, E>` and unit tests.
3. **Integration Layer:** Wire repositories, HTTP clients, and structured logging.
4. **UI / Entry Point:** Connect components/routes.

### 4.2. Commit Hygiene for Large Features
- **Split Large Features into Atomic Commits:** Never bundle an entire multi-layer feature into one massive commit. Commit incrementally per logical milestone (e.g., `feat(cms): add project schema`, `feat(cms): implement D1 repository`, `feat(cms): wire admin routes`).
- **Pre-Commit Sanity Check:** Always review `git status` before staging. Ensure generated artifacts, lockfile-managed vendor/skill `assets/`, or unrelated files are properly `.gitignore`d and not accidentally committed.
- **Conventional Commits:** Use concise messages (`feat`, `fix`, `refactor`, `chore`, `docs`) with clear scope.
