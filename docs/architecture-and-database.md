# Khang Viet Design - Backend Stack & Database Layer

## 1. Backend & Production Tech Stack

- **Edge Runtime:** [Cloudflare Workers](https://workers.cloudflare.com/) managed via [Wrangler](https://developers.cloudflare.com/workers/wrangler/).
- **Web API Framework:** [Hono v4](https://hono.dev/) (`hono`, `@hono/zod-openapi`).
- **Database Engine:** [Cloudflare D1](https://developers.cloudflare.com/d1/) (Serverless SQLite).
- **ORM & Schema Migrations:** [Drizzle ORM](https://orm.drizzle.team/) & `drizzle-kit`.
- **Primary Key Standard:** **UUIDv7** (RFC 9562) — k-sortable to protect SQLite B-Tree indexes.
- **Data Validation & Type Contracts:** [Zod](https://zod.dev/) & `@hono/zod-openapi`.
- **API Docs:** `/doc` (OpenAPI 3.0.0 JSON) and `/reference` (Scalar UI).
- **Auth & Security:** Web Crypto API (`crypto.subtle`) JWT, HttpOnly `refreshToken` rotation (`/api/auth`), PBKDF2-HMAC-SHA256 (100k iterations + 16-byte salt), RBAC (`authMiddleware.ts`, `adminAuthMiddleware.ts`), strict CORS (`apps/api/src/config/cors.ts`), sliding-window rate limiting (`rateLimiter.ts`), and `secureHeaders`.
- **Media Storage:** [Cloudflare R2](https://developers.cloudflare.com/r2/) (zero egress fee).

## 2. Database Layer (`@khangviet/repositories`)

### Schema (`packages/repositories/src/d1/schema/`)

| Table             | PK       | Key Columns                                                                                                                                                                                    | Purpose & Indexing                                            |
| :---------------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------ |
| `users`           | UUIDv7   | `email`, `password`, `role` (`ADMIN`/`CUSTOMER`), `name`, `phone`, `created_at`, `updated_at`                                                                                                  | Accounts & hashed passwords. B-Tree index on `email`.         |
| `leads`           | UUIDv7   | `full_name`, `phone`, `email`, `service_category`, `project_scale`, `message`, `status`, `notes`, `created_at`, `updated_at`                                                                   | Contact leads. Indexes on `status`, `created_at DESC`, `phone`. |
| `projects`        | UUIDv7   | `code`, `title`, `subtitle`, `client`, `locations` (JSON), `year`, `category_tag`, `scale_metric`, `materials` (JSON), `engineering_notes` (JSON), `summary`, `cover_image`, `gallery` (JSON) | Portfolio projects. Indexes on `code`, `category_tag`.        |
| `cms_metadata`    | Text Key | `key`, `value_json`, `updated_at`                                                                                                                                                              | Flexible JSON store (e.g. `hero_slides`, `legal_info`, clusters). |
| `pending_changes` | UUIDv7   | `action`, `target_id`, `payload` (JSON), `status` (`PENDING`/`APPLIED`/`DISCARDED`), `created_at`, `applied_at`                                                                                | Staging queue for Midnight Sync publishing.                   |

### Drivers & Migrations

- **Drivers (`src/d1/repositories/`):** `D1UserRepository`, `D1LeadRepository`, `D1CmsRepository` (split into `D1CmsProjectRepo` and `D1CmsMetaRepo`).
- **Drizzle Kit Config:** `packages/repositories/drizzle.config.ts`
- **Generate Migration:** `pnpm --filter @khangviet/repositories run db:generate`
- **Seed Data:** `packages/repositories/src/d1/seed.ts`
