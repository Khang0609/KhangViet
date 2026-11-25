# Khang Việt Design — Website v1 Launch Roadmap

**North Star Goal:** Lead Generation & Enterprise Credibility — showcase real 3D-vs-Actual craftsmanship to win B2B/enterprise and retail-chain contracts via quote requests.

**Target Timeline:** 1-Week Sprint (`2026-11-25` → `2026-12-01`)  
**Scope Strategy:** Lean v1 Launch on `khangviet.vn` (deferring R2 upload & advanced layout customization to v1.1).

---

## Milestone 1 — Complete Schema v2 & Project Media Editor (Days 1–2)

**Objective:** Finish the remaining code gaps on `refactor/schema-v2` so every public and admin workflow is complete and merge-ready.

- [ ] **Auto-order `/projects` clusters by project count**
  - Update `resolveGalleryClusters` in `apps/web/lib/galleryClusters.ts` so both Partner clusters and Technical Solution clusters sort by `projects.length` descending (most projects first).
- [ ] **Convert `/admin/projects/[slug]` into a Single-Project Media & 3D-vs-Actual Editor** *(resolves `docs/schema-v2-todo.md`)*
  - Clicking a project row in `/admin/projects` opens its dedicated workspace to manage:
    - Gallery photos (`project_media`: add/remove URLs, reorder, mark `isCover`).
    - 3D-vs-Actual comparison pairs (`project_comparisons`: 3D render URL vs. actual site photo URL + label).
  - Keep Gear icon for project metadata/status settings and Trash icon for deletion.
- [ ] **End-to-End Local Verification & Merge**
  - Verify `tsc --noEmit` across `packages/types`, `packages/repositories`, `apps/api`, `apps/web`.
  - Verify `next build --webpack` and `apps/api/test-endpoints.mjs`.
  - Merge `refactor/schema-v2` into `develop` (and `main` when ready for M3).

**Exit Criteria:** A non-technical admin can create a project, attach a partner, add gallery photos, set a cover, add 3D-vs-Actual pairs, publish it, and see it live on `/projects` and `/projects/[slug]` locally.

---

## Milestone 2 — Real Content Seeding & Mobile/Desktop QA (Days 3–5)

**Objective:** Replace sample/placeholder data with real Khang Việt Design projects and verify conversion paths.

- [ ] **Curate 6–10 Real Projects**
  - Place optimized project photos & 3D renders in `apps/web/public/images/projects/` (or verified external URLs).
  - Add real Partners/Brands (e.g., BIDV, BigC / GO!, retail chains) via `/admin/partners`.
  - Publish 6–10 projects with complete specs, categories/services, and at least 2–3 projects with 3D-vs-Actual comparison sliders.
- [ ] **Conversion & UX QA**
  - Test quote request forms (`QuoteRequestModal`, `QuickQuoteForm`) end-to-end → verify leads appear in `/admin/leads`.
  - Check mobile & desktop responsiveness on Landing (`/`), Gallery (`/projects`), Project Detail (`/projects/[slug]`), and 3D-vs-Actual slider.
  - Verify Vietnamese copy, brand colors (`#050709`, `#F58633`), and zero placeholder text.
- [ ] **Basic SEO & Metadata Check**
  - Confirm page titles, descriptions, OpenGraph tags, and `sitemap` / `robots` for `https://khangviet.vn`.

**Exit Criteria:** 6–10 real projects published, all images load cleanly, and quote submission → `/admin/leads` works smoothly on both desktop and mobile.

---

## Milestone 3 — Production Infrastructure & Go-Live on `khangviet.vn` (Days 6–7)

**Objective:** Deploy securely to Cloudflare Workers + D1 with Zero Trust Admin protection and instant Telegram lead alerts.

- [ ] **Cloudflare D1 Production Migration & Seed**
  - Run `0000_sweet_callisto.sql` against remote `khangviet-db`.
  - Sync/seed initial partners, services, and curated projects to remote D1.
- [ ] **Cloudflare Access Zero Trust (`/admin` & `/api/v1/admin/*`)**
  - Configure Cloudflare Access application protecting `/admin*` and `/api/v1/admin/*`.
  - Set Worker secrets/vars: `CF_ACCESS_TEAM_DOMAIN` and `CF_ACCESS_AUD` so `authMiddleware.ts` enforces RS256 JWT verification in production.
- [ ] **Telegram Lead Alerts**
  - Set Worker secrets `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` so `leadNotifier.ts` sends instant alerts on every new quote request.
- [ ] **Deploy & Smoke Test on `https://khangviet.vn`**
  - Build `apps/web` static export + deploy `apps/api` Worker with custom domain `khangviet.vn`.
  - Run live smoke test: submit 1 test quote → confirm Telegram alert + `/admin/leads` entry → verify `/admin` blocks unauthorized users and allows authorized Khang Việt emails.

**Exit Criteria:** `https://khangviet.vn` is live, `/admin` is protected by Cloudflare Access, and real leads trigger instant Telegram notifications.

---

## Post-Launch Backlog (v1.1+)

Parked intentionally so v1 ships on time:
- **Cloudflare R2 Direct Image Upload:** Upload photos directly from `/admin/projects/[slug]` instead of static assets / URLs.
- **Per-Cluster Bento Layout Presets:** Optional admin controls if manual grid overrides are ever needed beyond automatic project-count ordering.
- **Lead Workflow Enhancements:** Email/Zalo OA notifications, lead assignment, or automated follow-up reminders.
- **Analytics & Conversion Tracking:** Cloudflare Web Analytics / GA4 / Meta Pixel for quote form conversion tracking.
