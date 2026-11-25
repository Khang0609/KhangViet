# Báo Cáo Khảo Sát Kỹ Thuật: Database Schema & Migrations Layer (Milestone 1)

**Tác giả:** Explorer 1 (Database & Schema Explorer)  
**Ngày thực hiện:** 2026-11-08  
**Trạng thái:** Hoàn thành khảo sát (Completed)  
**Phạm vi:** `packages/repositories`, `packages/types`, `packages/data`, `apps/api`, `apps/web`

---

## 1. Tóm Tắt Khảo Sát & Mục Tiêu Milestone 1

Hệ thống Khang Việt Design hiện tại đang vận hành trên nền tảng Cloudflare Edge-Native (Cloudflare Workers + D1 Serverless SQLite + Drizzle ORM). Mục tiêu của Milestone 1 là thực hiện tái thiết kế toàn diện tầng Database:
1. **Party / Identity Data Model (Enterprise Architecture):**
   - Tách rời thực thể con người / pháp nhân (`identities`) ra khỏi tài khoản xác thực đăng nhập (`user_accounts`).
   - Hỗ trợ cá nhân (`INDIVIDUAL`) và tổ chức doanh nghiệp (`ORGANIZATION`) với trường `tax_code` nullable phục vụ khách hàng B2B.
   - Chuẩn hóa quan hệ CRM: Bảng `leads` liên kết với `identities`, và tạo mới bảng `lead_activities` theo dõi lịch sử tương tác.
2. **Chuẩn Hóa 3NF Danh Mục Công Trình & Media (Projects & Media R2):**
   - Loại bỏ cột `gallery` JSON khỏi bảng `projects`.
   - Đổi kiểu dữ liệu `year` từ `text` sang `integer` (ràng buộc kiểm tra `1990 <= year <= 2100`).
   - Bổ sung các trường quản trị: `status` ('DRAFT', 'PUBLISHED', 'ARCHIVED'), `sort_order`, `client_identity_id` (FK tới `identities`), `created_at`, `updated_at`.
   - Xóa bỏ index trùng lặp trên cột `code` (đã có Unique Index).
   - Tạo mới bảng `project_media` để quản lý các tài sản media phân tán trên Cloudflare R2 (`khangviet-media`).
3. **Bảo Tồn Tính Toàn Vẹn & Tương Thích Ngược (Zero Downtime / Zero Breakage):**
   - Toàn bộ API hiện hữu (`/api/auth/*`, `/api/protected`, `/api/v1/content/*`, `/api/v1/leads/*`, `/api/v1/admin/*`) phải duy trì hoạt động chính xác 100%.
   - Giao diện Admin UI và Web Client không bị gián đoạn hay mất dữ liệu gallery/location/spec.

---

## 2. Khảo Sát Chi Tiết Hiện Trạng Hệ Thống

### 2.1. Cấu Trúc `packages/repositories`
- **Drizzle Config (`drizzle.config.ts`):**
  - Schema path: `./src/d1/schema/index.ts`
  - Dialect: `sqlite`
  - Migrations output: `./migrations`
- **Schema hiện tại (`src/d1/schema/*`):**
  - `users.schema.ts`: `usersTable` (cột: `id`, `email`, `password`, `role`, `name`, `phone`, `created_at`, `updated_at`).
    * *Phát hiện:* Cột `email` vừa khai báo `.unique()` vừa có `index("idx_users_email").on(table.email)`, dẫn đến việc SQLite tạo 2 index trùng lặp (`users_email_unique` và `idx_users_email`).
  - `leads.schema.ts`: `leadsTable` (cột: `id`, `full_name`, `phone`, `email`, `service_category`, `project_scale`, `message`, `status`, `notes`, `created_at`, `updated_at`).
  - `projects.schema.ts`: `projectsTable` (cột: `id`, `code`, `title`, `subtitle`, `client`, `locations`, `year` [text], `category_tag`, `scale_metric`, `materials`, `engineering_notes`, `summary`, `cover_image`, `gallery` [json]).
    * *Phát hiện:* Cột `code` vừa có `.unique()` vừa có `index("idx_projects_code").on(table.code)` tạo duplicate index trong file migration `0000_magenta_midnight.sql`.
  - `cms.schema.ts`: `cmsMetadataTable` (key-value store) và `pendingChangesTable` (hàng đợi Staging / Midnight sync).
- **Migration & Journal:**
  - `migrations/0000_magenta_midnight.sql`: Chứa 5 bảng ban đầu (`users`, `leads`, `projects`, `cms_metadata`, `pending_changes`).
  - `migrations/meta/_journal.json`: Quản lý migration version `0000_magenta_midnight`.
- **Seed Scripts (`src/d1/seed.ts`):**
  - Hàm `seedD1Database(client: D1Client)` nạp dữ liệu từ `@khangviet/data`: `initialUsers`, `initialLeads`, `initialLandingContent.featuredProjects`, `hero_slides`, `legal_info`.
- **Factory Resolution (`src/factory.ts`):**
  - `getRepositories(driver = 'json', d1Binding?)`: Trả về `{ cms, lead, user }`. Khi `driver === 'd1'` và có `d1Binding`, khởi tạo D1 client với Drizzle ORM.

### 2.2. Cấu Trúc `packages/types`
- `user.ts`:
  - `UserRoleSchema`: Hiện chỉ có `z.enum(["ADMIN", "CUSTOMER"])`. **Cần bổ sung `"STAFF"`**.
  - `UserSchema` & `SafeUserSchema`: Yêu cầu `info: { name, phone }`.
  - `LoginResponseDataSchema`, `AccessTokenPayloadSchema`: Gắn liền với `SafeUser`.
- `crm.ts`:
  - `LeadStatusSchema`: `["NEW", "CONTACTED", "SURVEY_SCHEDULED", "QUOTED", "WON", "LOST"]`.
  - `ContactLeadSchema` & `CreateLeadDtoSchema`: Định nghĩa các trường lead liên hệ.
- `project.ts`:
  - `FeaturedProjectSchema`: `year: z.string()`, `gallery: z.array(ProjectGalleryItemSchema)`.
  - `ProjectGalleryItemSchema`:
    ```ts
    {
      id: string;
      src: string;
      caption: string;
      location: string;
      spec: string;
      aspect: "landscape" | "portrait" | "wide";
    }
    ```
  - **Phát hiện quan trọng:** Mỗi item gallery có chứa `location` và `spec`. Nếu bảng `project_media` bỏ quên 2 trường này, toàn bộ chi tiết vật liệu kỹ thuật và vị trí trên giao diện Lightbox Modal của Web sẽ bị rỗng!

### 2.3. Cấu Trúc `apps/api`
- **Routes & Handlers:**
  - `auth.ts`: Gọi `AuthService.login()` và `AuthService.refresh()`. Phụ thuộc vào `userRepo.findByEmail()` và `userRepo.findSafeById()`.
  - `protected.ts`: Bảo vệ bằng `authMiddleware`, trả về `user.info.name` và `SafeUser`.
  - `publicContent.ts`: Cung cấp `GET /api/v1/content/landing`, `GET /projects`, `GET /projects/:id`. Response trả về `FeaturedProject` có mảng `gallery`.
  - `adminCms.ts` & `adminCmsHelper.ts`: Xử lý thêm/sửa/xóa dự án (`createProjectRoute`, `updateProjectRoute`, `deleteProjectRoute`).
  - `publicLeads.ts` & `adminLeads.ts`: Tiếp nhận lead công khai và quản lý CRM lead cho Admin.
- **Middleware:**
  - `authMiddleware.ts`: Giải mã JWT Bearer token và kiểm tra quyền RBAC.
  - `adminAuth.ts`: Kiểm tra role `ADMIN`.
- **Automated Tests:**
  - `apps/api/test-e2e.mjs`: Test suite gồm 12 kịch bản (Zod validation, wrong pass, login Admin, protected route, RBAC check, refresh token cookie rotation, security headers, CORS origin rejection/whitelisting, rate limiting 20 reqs/min, PBKDF2 hash verification).
  - Lệnh chạy: `pnpm --filter api test:auth`. Hiện tại pass 100%.

### 2.4. Tình Trạng Build Commands Trong Monorepo
- `packages/repositories/package.json`:
  * Hiện chỉ có script `"test"` và `"db:generate"`. **Không có script `"build"`**.
  * Chạy `pnpm --filter @khangviet/repositories build` báo lỗi `ERR_PNPM_RECURSIVE_RUN_NO_SCRIPT`.
  * Khắc phục: Khai báo `"build": "tsc --noEmit"` trong `package.json`.
- `apps/api/package.json`:
  * Hiện có `"dev"`, `"deploy"`, `"cf-typegen"`, `"test:auth"`, `"test:fuzz"`. **Không có script `"build"`**.
  * Chạy `pnpm --filter api build` báo lỗi `ERR_PNPM_RECURSIVE_RUN_NO_SCRIPT`.
  * Khắc phục: Khai báo `"build": "wrangler deploy --dry-run --outdir=dist"` trong `package.json`.
- `apps/web/package.json`:
  * Script `"build": "next build --webpack"` chạy hoàn tất thành công (Exit code 0).

---

## 3. Kiến Trúc Database Mới (Target State - Milestone 1)

### 3.1. Party / Identity Data Model

```
+-------------------------------------------------------------+
|                         identities                          |
+-------------------------------------------------------------+
| id                 TEXT PRIMARY KEY (UUIDv7)                |
| full_name          TEXT NOT NULL                            |
| phone              TEXT NOT NULL (INDEX: idx_identities_phone)|
| email              TEXT NULLABLE                            |
| tax_code           TEXT NULLABLE (Dành cho doanh nghiệp B2B)|
| identity_type      TEXT NOT NULL (INDIVIDUAL / ORGANIZATION)|
| address            TEXT NULLABLE                            |
| notes              TEXT NULLABLE                            |
| created_at         TEXT NOT NULL                            |
| updated_at         TEXT NOT NULL                            |
+-------------------------------------------------------------+
        | 1                                    | 1
        |                                      |
        v 0..1 (Tài khoản đăng nhập)          v 0..* (Khách hàng CRM)
+------------------------------------+   +------------------------------------+
|           user_accounts            |   |               leads                |
+------------------------------------+   +------------------------------------+
| id            TEXT PK (UUIDv7)     |   | id               TEXT PK (UUIDv7)  |
| identity_id   TEXT FK->identities  |   | identity_id      TEXT FK->identities|
| email         TEXT NOT NULL UNIQUE |   | service_category TEXT NULLABLE     |
| password_hash TEXT NOT NULL        |   | project_scale    TEXT NULLABLE     |
| role          TEXT NOT NULL        |   | initial_message  TEXT NULLABLE     |
|               (ADMIN/STAFF/CUSTOMER)|   | status           TEXT NOT NULL     |
| is_active     INTEGER DEFAULT 1    |   | created_at       TEXT NOT NULL     |
| created_at    TEXT NOT NULL        |   | updated_at       TEXT NOT NULL     |
| updated_at    TEXT NOT NULL        |   +------------------------------------+
+------------------------------------+                     | 1
                                                           |
                                                           v 0..* (Nhật ký xử lý)
                                                 +------------------------------------+
                                                 |          lead_activities           |
                                                 +------------------------------------+
                                                 | id                TEXT PK (UUIDv7) |
                                                 | lead_id           TEXT FK->leads   |
                                                 | staff_identity_id TEXT FK (null)   |
                                                 | action_type       TEXT NOT NULL    |
                                                 | content           TEXT NOT NULL    |
                                                 | created_at        TEXT NOT NULL    |
                                                 +------------------------------------+
```

### 3.2. Chuẩn Hóa 3NF Projects & Media (R2 Ready)

```
+-------------------------------------------------------------+
|                          projects                           |
+-------------------------------------------------------------+
| id                   TEXT PRIMARY KEY (UUIDv7)              |
| code                 TEXT NOT NULL UNIQUE (Slug duy nhất)   |
| title                TEXT NOT NULL                          |
| subtitle             TEXT NOT NULL                          |
| client               TEXT NOT NULL                          |
| client_identity_id   TEXT NULLABLE FK->identities(id)       |
| locations            TEXT NOT NULL (JSON array)             |
| year                 INTEGER NOT NULL (CHECK: 1990..2100)   |
| category_tag         TEXT NOT NULL                          |
| scale_metric         TEXT NOT NULL                          |
| materials            TEXT NOT NULL (JSON array)             |
| engineering_notes    TEXT NOT NULL (JSON array)             |
| summary              TEXT NOT NULL                          |
| cover_image          TEXT NOT NULL                          |
| status               TEXT NOT NULL DEFAULT 'PUBLISHED'      |
|                      (CHECK: 'DRAFT', 'PUBLISHED', 'ARCHIVED')
| sort_order           INTEGER NOT NULL DEFAULT 0             |
| created_at           TEXT NOT NULL                          |
| updated_at           TEXT NOT NULL                          |
+-------------------------------------------------------------+
        | 1
        | ON DELETE CASCADE
        v 0..*
+-------------------------------------------------------------+
|                       project_media                         |
+-------------------------------------------------------------+
| id                 TEXT PRIMARY KEY (UUIDv7)                |
| project_id         TEXT NOT NULL FK->projects(id) ON CASCADE|
| media_type         TEXT NOT NULL DEFAULT 'GALLERY_IMAGE'    |
|                    (CHECK: COVER, GALLERY_IMAGE,            |
|                     FLOOR_PLAN, VIDEO)                      |
| r2_key             TEXT NULLABLE                            |
| public_url         TEXT NOT NULL                            |
| caption            TEXT NULLABLE                            |
| location           TEXT NULLABLE (Vị trí chụp khung hình)   |
| spec               TEXT NULLABLE (Thông số vật tư kỹ liệu)  |
| aspect_ratio       TEXT NULLABLE (landscape/portrait/wide)  |
| width_px           INTEGER NULLABLE                         |
| height_px          INTEGER NULLABLE                         |
| file_size_bytes    INTEGER NULLABLE                         |
| sort_order         INTEGER NOT NULL DEFAULT 0               |
| created_at         TEXT NOT NULL                            |
+-------------------------------------------------------------+
```

---

## 4. Ma Trận Đánh Giá Tác Động & Điểm Breakage (Impact Matrix)

| Vị Trí Code / Module | Trạng Thái Hiện Tại | Thay Đổi Schema Mới | Nguy Cơ Phá Vỡ (Breakage) | Chiến Lược Giải Quyết (Adapter Strategy) |
| :--- | :--- | :--- | :--- | :--- |
| **`D1UserRepository`** | Đọc ghi trực tiếp `usersTable` (`id`, `name`, `phone`, `password`) | Bảng `users` bị xóa, thay bằng `user_accounts` + `identities` | Gãy toàn bộ luồng Auth, Login, Refresh, Protected route | **Repository Adapter:** Sử dụng `JOIN user_accounts INNER JOIN identities ON user_accounts.identity_id = identities.id`. Trả về `User` và `SafeUser` với đầy đủ cấu trúc `{ id, email, role, password, info: { name, phone } }`. Giữ nguyên 100% chữ ký của `IUserRepository`. |
| **`D1LeadRepository`** | Đọc ghi `full_name`, `phone`, `email` trực tiếp trên `leadsTable` | Các trường định danh chuyển sang `identities` | Gãy API nộp form tư vấn (`POST /api/v1/leads`) và CRM Admin | **Repository Adapter:** Trong `createLead`, tự động tìm hoặc tạo bản ghi trong `identitiesTable` theo số điện thoại (`phone`), sau đó ghi bản ghi `leadsTable` trỏ vào `identity_id`. Trong `getLeads` và `getLeadById`, thực hiện `LEFT JOIN identities` để trả về định dạng `ContactLead` chuẩn cho caller. |
| **`D1CmsProjectRepo`** | Lưu mảng `gallery` JSON trực tiếp trong `projectsTable` | Cột `gallery` bị loại bỏ; `year` đổi từ `text` sang `integer` | Gãy API `/api/v1/content/landing`, `/projects`, `/projects/:id` và Admin Project Form | **Repository Adapter:** Khi truy vấn `getProjects` hoặc `getProjectById`, repo query song song bảng `project_mediaTable` (hoặc join) theo `project_id`, sắp xếp theo `sort_order`, map ngược lại thành `ProjectGalleryItem[]` gắn vào thuộc tính `gallery` của `FeaturedProject`. Khi tạo/cập nhật project, tự động batch insert/sync sang `project_mediaTable`. |
| **`packages/types`** | `UserRoleSchema` chỉ có `ADMIN` và `CUSTOMER` | Bổ sung `STAFF` | Zod validation chặn token hoặc user có role `STAFF` | Cập nhật `UserRoleSchema = z.enum(["ADMIN", "STAFF", "CUSTOMER"])`. Thêm types `Identity`, `UserAccount`, `ProjectMedia`. Cập nhật `FeaturedProjectSchema.year` hỗ trợ cả `z.number()` và `z.string().regex(/^\d+$/).transform(Number)`. |
| **`apps/api/test-e2e.mjs`** | Test đăng nhập và RBAC kiểm tra trường `user.info.name`, `user.email` | Schema backend thay đổi | Không pass nếu payload trả về bị biến đổi | Nhờ Repository Adapter ánh xạ chuẩn `SafeUser`, toàn bộ 12 test case trong `test-e2e.mjs` sẽ tiếp tục vượt qua 100%. |
| **`apps/web`** | Component `ProjectLightboxModal`, `ProjectGalleryViewer` truy cập `item.location`, `item.spec` | Nếu `project_media` chỉ lưu `caption`, mất dữ liệu specs | Giao diện hiển thị bị trống thông số kỹ thuật bản vẽ | Bảng `project_media` bắt buộc có cột `location` và `spec` (nullable) để đảm bảo tính toàn vẹn 100% của dữ liệu hiển thị. |

---

## 5. Kế Hoạch Triển Khai Migration D1 SQL (`0001_enterprise_identities_and_media.sql`)

Do SQLite trên Cloudflare D1 không hỗ trợ đầy đủ các lệnh `ALTER TABLE MODIFY COLUMN` phức tạp, chiến lược migration chuẩn nhất là phương pháp **Re-create & Migrate Data** an toàn:

### Chi Tiết Kịch Bản Migration SQL:
```sql
-- Migration: 0001_enterprise_identities_and_media.sql
-- Description: Triển khai Enterprise Party/Identity Data Model & Chuẩn hóa 3NF Projects/Media

PRAGMA foreign_keys = OFF;

-- 1. Tạo bảng identities
CREATE TABLE IF NOT EXISTS `identities` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`tax_code` text,
	`identity_type` text DEFAULT 'INDIVIDUAL' NOT NULL,
	`address` text,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
CREATE INDEX IF NOT EXISTS `idx_identities_phone` ON `identities` (`phone`);

-- 2. Tạo bảng user_accounts
CREATE TABLE IF NOT EXISTS `user_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`identity_id` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'CUSTOMER' NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`identity_id`) REFERENCES `identities`(`id`) ON UPDATE NO ACTION ON DELETE RESTRICT
);
CREATE UNIQUE INDEX IF NOT EXISTS `user_accounts_email_unique` ON `user_accounts` (`email`);

-- 3. Tạo bảng leads mới
CREATE TABLE IF NOT EXISTS `leads_new` (
	`id` text PRIMARY KEY NOT NULL,
	`identity_id` text NOT NULL,
	`service_category` text,
	`project_scale` text,
	`initial_message` text,
	`status` text DEFAULT 'NEW' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`identity_id`) REFERENCES `identities`(`id`) ON UPDATE NO ACTION ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS `idx_leads_identity_id` ON `leads_new` (`identity_id`);
CREATE INDEX IF NOT EXISTS `idx_leads_status` ON `leads_new` (`status`);
CREATE INDEX IF NOT EXISTS `idx_leads_created_at` ON `leads_new` (`created_at`);

-- 4. Tạo bảng lead_activities
CREATE TABLE IF NOT EXISTS `lead_activities` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_id` text NOT NULL,
	`staff_identity_id` text,
	`action_type` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`lead_id`) REFERENCES `leads_new`(`id`) ON UPDATE NO ACTION ON DELETE CASCADE,
	FOREIGN KEY (`staff_identity_id`) REFERENCES `identities`(`id`) ON UPDATE NO ACTION ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS `idx_lead_activities_lead_id` ON `lead_activities` (`lead_id`);

-- 5. Tạo bảng projects mới (không có gallery, year là integer, loại bỏ duplicate index trên code)
CREATE TABLE IF NOT EXISTS `projects_new` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`title` text NOT NULL,
	`subtitle` text NOT NULL,
	`client` text NOT NULL,
	`client_identity_id` text,
	`locations` text NOT NULL,
	`year` integer NOT NULL,
	`category_tag` text NOT NULL,
	`scale_metric` text NOT NULL,
	`materials` text NOT NULL,
	`engineering_notes` text NOT NULL,
	`summary` text NOT NULL,
	`cover_image` text NOT NULL,
	`status` text DEFAULT 'PUBLISHED' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`client_identity_id`) REFERENCES `identities`(`id`) ON UPDATE NO ACTION ON DELETE SET NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS `projects_code_unique` ON `projects_new` (`code`);
CREATE INDEX IF NOT EXISTS `idx_projects_category` ON `projects_new` (`category_tag`);
CREATE INDEX IF NOT EXISTS `idx_projects_status` ON `projects_new` (`status`);

-- 6. Tạo bảng project_media
CREATE TABLE IF NOT EXISTS `project_media` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`media_type` text DEFAULT 'GALLERY_IMAGE' NOT NULL,
	`r2_key` text,
	`public_url` text NOT NULL,
	`caption` text,
	`location` text,
	`spec` text,
	`aspect_ratio` text,
	`width_px` integer,
	`height_px` integer,
	`file_size_bytes` integer,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects_new`(`id`) ON UPDATE NO ACTION ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS `idx_project_media_project_id` ON `project_media` (`project_id`);
CREATE INDEX IF NOT EXISTS `idx_project_media_sort` ON `project_media` (`sort_order`);

-- 7. DI CHUYỂN DỮ LIỆU HIỆN CÓ (Data Migration từ các bảng cũ nếu tồn tại)
-- 7a. Chuyển users -> identities + user_accounts
INSERT OR IGNORE INTO `identities` (`id`, `full_name`, `phone`, `email`, `identity_type`, `created_at`, `updated_at`)
SELECT `id`, `name`, `phone`, `email`, 'INDIVIDUAL', `created_at`, `updated_at`
FROM `users`;

INSERT OR IGNORE INTO `user_accounts` (`id`, `identity_id`, `email`, `password_hash`, `role`, `is_active`, `created_at`, `updated_at`)
SELECT `id`, `id`, `email`, `password`, `role`, 1, `created_at`, `updated_at`
FROM `users`;

-- 7b. Chuyển leads -> identities (nếu chưa có) + leads_new
INSERT OR IGNORE INTO `identities` (`id`, `full_name`, `phone`, `email`, `identity_type`, `notes`, `created_at`, `updated_at`)
SELECT `id`, `full_name`, `phone`, `email`, 'INDIVIDUAL', `notes`, `created_at`, `updated_at`
FROM `leads`;

INSERT OR IGNORE INTO `leads_new` (`id`, `identity_id`, `service_category`, `project_scale`, `initial_message`, `status`, `created_at`, `updated_at`)
SELECT `id`, `id`, `service_category`, `project_scale`, `message`, `status`, `created_at`, `updated_at`
FROM `leads`;

-- 7c. Chuyển projects -> projects_new
INSERT OR IGNORE INTO `projects_new` (`id`, `code`, `title`, `subtitle`, `client`, `locations`, `year`, `category_tag`, `scale_metric`, `materials`, `engineering_notes`, `summary`, `cover_image`, `status`, `sort_order`, `created_at`, `updated_at`)
SELECT `id`, `code`, `title`, `subtitle`, `client`, `locations`, CAST(`year` AS INTEGER), `category_tag`, `scale_metric`, `materials`, `engineering_notes`, `summary`, `cover_image`, 'PUBLISHED', 0, datetime('now'), datetime('now')
FROM `projects`;

-- 8. Hoán đổi bảng (Drop old tables and rename new ones)
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `leads`;
DROP TABLE IF EXISTS `projects`;

ALTER TABLE `leads_new` RENAME TO `leads`;
ALTER TABLE `projects_new` RENAME TO `projects`;

PRAGMA foreign_keys = ON;
```

---

## 6. Đề Xuất Cấu Hình & Scripts Cho Milestone 1

1. **Bổ sung scripts build vào `package.json`:**
   - Trong `packages/repositories/package.json`:
     ```json
     "scripts": {
       "build": "tsc --noEmit",
       "test": "node --test test/*.test.mjs",
       "db:generate": "drizzle-kit generate"
     }
     ```
   - Trong `apps/api/package.json`:
     ```json
     "scripts": {
       "build": "wrangler deploy --dry-run --outdir=dist",
       "dev": "wrangler dev",
       "deploy": "wrangler deploy --minify",
       "test:auth": "wrangler deploy --dry-run --outdir=dist && node test-e2e.mjs"
     }
     ```
   - Điều này đảm bảo tiêu chí nghiệm thu Acceptance Criteria:
     `pnpm --filter @khangviet/repositories build`, `pnpm --filter api build`, `pnpm --filter web build` đều chạy thành công 100%.

2. **Cập nhật Seed Script (`src/d1/seed.ts`):**
   - Cập nhật hàm `seedD1Database` để nạp dữ liệu tuần tự:
     1. Seed `identities` (từ `initialUsers` và `initialLeads`).
     2. Seed `user_accounts` (trỏ `identity_id` tương ứng).
     3. Seed `leads` (trỏ `identity_id`).
     4. Seed `projects` (bỏ qua gallery, `year` ép kiểu số).
     5. Seed `project_media` (duyệt qua từng item trong `project.gallery` để tạo các bản ghi media với `location`, `spec`, `public_url`).
     6. Seed `cms_metadata`.

3. **Thiết Lập Bộ Unit/Integration Tests Mới Cho Milestone 1:**
   - Tạo file test `packages/repositories/test/party-media-schema.test.mjs`:
     * Kiểm thử insert và foreign key constraint giữa `identities` và `user_accounts`.
     * Kiểm thử `ON DELETE RESTRICT` khi xóa `identities` có liên kết `user_accounts`.
     * Kiểm thử `ON DELETE CASCADE` khi xóa `projects` thì toàn bộ bản ghi `project_media` liên quan bị xóa tự động.
     * Kiểm thử ràng buộc `year` integer và `unique(code)` không bị duplicate index.
