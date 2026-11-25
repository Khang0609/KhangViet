# Khang Viet Design - Engineering Constitution

## Stack Overview

- **Monorepo:** `apps/web` (Next.js static export + Tailwind CSS v4), `apps/api` (Hono v4 on Cloudflare Workers), `packages/types` (Zod contracts), `packages/repositories` (D1 + Drizzle ORM / JSON fallback).
- **Reference Docs (read only when needed):**
  - Backend & DB Schema: `docs/architecture-and-database.md`
  - API Endpoints Map: `docs/api-routes.md`
  - Cloudflare Production Deploy: `docs/deploy-cloudflare.md`
  - Seeded Dev Accounts: `packages/repositories/src/d1/seed.ts`

## Non-Negotiable Rules

1. **Contract-First:** Always update Zod schemas in `packages/types` and `apps/api/src/contracts/` before writing route handlers or UI consumers.
2. **Factory DB Resolution:** Always resolve repositories with `getRepositories(c.env?.DB ? "d1" : "json", c.env?.DB)`.
3. **Tailwind CSS v4:** Follow `.agents/rules/tailwindcss-v4.md` (no v3 syntax like `bg-[var(--*)]`, `bg-gradient-*`, `flex-shrink-*`, `ring-offset-*`).
4. **Git Branch Discipline:** Follow `.agents/skills/git-branch-workflow.md`; verify the active branch before staging/committing.
5. **Graphify-First:** When `graphify-out/` exists, query Graphify before broad grep/file-reading sweeps.
6. **No Prompt-Reference Leakage in UI:** Never copy reference/analogy keywords from user prompts (e.g., "YouTube Studio", "Notion-like", "Figma-style") into production UI labels, buttons, headings, or copy. Use domain-appropriate Khang Việt copy only.
7. **Cookie-Only Auth (No `localStorage` Tokens):** Never store JWT/session tokens in `localStorage` or send `Authorization: Bearer` from browser clients. Use `HttpOnly` `session_id` cookies with `credentials: "include"` and verify/clear sessions via `GET /api/auth/me` and `POST /api/auth/logout`.
8. **Fail-Closed Production Secrets:** Never fall back to dev default secrets (`JWT_SECRET`, `REVALIDATE_SECRET`) when `NODE_ENV === "production"` or `ENVIRONMENT === "production"` — throw immediately. Never pass secrets in URL query strings.
9. **Single-Unwrap `apiClient`:** `apiClient` already unwraps `json.data`; never read `res.data.data` in `apps/web/lib/*Api.ts`.
10. **Commit-Issue Traceability (Enforced by CI):** Every non-merge commit message MUST include a GitHub closing keyword (`Close`, `Closes`, `Closed`, `Fix`, `Fixes`, `Fixed`, `Resolve`, `Resolves`, `Resolved`) followed by an issue number `#<number>` (e.g., `Closes #3: auto-order gallery clusters by project count`).
