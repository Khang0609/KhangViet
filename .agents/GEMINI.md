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
4. **Single-Trunk Git Discipline:** `main` is the only permanent trunk. Branch in place (`git checkout -b feat/<name> main`) for single-agent tasks; use `git worktree` only for parallel agents or risky refactors.
5. **Graphify-First:** When `graphify-out/` exists, query Graphify before broad grep/file-reading sweeps.
6. **No Prompt-Reference Leakage in UI:** Never copy reference/analogy keywords from user prompts (e.g., "YouTube Studio", "Notion-like", "Figma-style") into production UI labels, buttons, headings, or copy. Use domain-appropriate Khang Việt copy only.
7. **Cloudflare Access Zero Trust (No `localStorage` Tokens):** Never store auth/session tokens in `localStorage` or send `Authorization: Bearer` from browser clients. Admin routes are protected by Cloudflare Access (`Cf-Access-Jwt-Assertion` verified via `CF_ACCESS_TEAM_DOMAIN` and `CF_ACCESS_AUD`). Localhost dev bypass is allowed only when hostname is `127.0.0.1`/`localhost` and `CF_ACCESS_*` are unset.
8. **Fail-Closed Production Secrets:** Never fall back to dev default secrets (`REVALIDATE_SECRET`, `TELEGRAM_BOT_TOKEN`) when `NODE_ENV === "production"` or `ENVIRONMENT === "production"` — throw immediately. Never pass secrets in URL query strings (use headers like `x-revalidate-secret`).
9. **Single-Unwrap `apiClient`:** `apiClient` already unwraps `json.data`; never read `res.data.data` in `apps/web/lib/*Api.ts` (enforced by ESLint).
10. **Commit-Issue Traceability (`apps/**`, `packages/**`):** PRs/pushes to `main` touching `apps/` or `packages/` require a GitHub closing keyword (`Closes #<number>`).
11. **CI-First Error Loop:** When fixing a bug, encode a deterministic lint/test/CI check in the repo first, then run `/wiki-ingest` to persist generalized lessons to Second Brain.
