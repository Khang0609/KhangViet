# Khang Viet Design - Architecture, Database & API Overview

> Tài liệu chuẩn hóa cấu trúc hệ thống, API Routes, Database layer (Cloudflare D1 & Drizzle ORM), quy trình sản xuất (Produce/Deploy) và Security Architecture để các phiên làm việc tiếp theo nắm bắt nhanh và tiếp tục mở rộng.

---

## 1. Backend & Production Tech Stack

Hệ thống được thiết kế theo kiến trúc **Serverless Edge-Native** nhằm tối ưu tối đa chi phí (0 VNĐ hạ tầng cơ sở ban đầu), độ trễ cận 0ms và tính sẵn sàng toàn cầu:

- **Edge Runtime:** [Cloudflare Workers](https://workers.cloudflare.com/) quản lý và build qua [Wrangler](https://developers.cloudflare.com/workers/wrangler/).
- **Web API Framework:** [Hono v4](https://hono.dev/) (`hono`, `@hono/zod-openapi`).
- **Database Engine:** [Cloudflare D1](https://developers.cloudflare.com/d1/) (Serverless SQLite phân tán trên mạng lưới toàn cầu của Cloudflare).
- **ORM & Schema Migrations:** [Drizzle ORM](https://orm.drizzle.team/) & `drizzle-kit` (Type-safe SQL builder, zero-overhead, bundle siêu nhẹ < 30KB).
- **Primary Key Standard:** **UUIDv7** (RFC 9562) - sinh khóa tuần tự theo thời gian (k-sortable) giúp bảo vệ B-Tree Index của SQLite, chống phân mảnh trang đĩa (page fragmentation).
- **Data Validation & Type Contracts:** [Zod](https://zod.dev/) & `@hono/zod-openapi` (Contract-first OpenAPI schemas).
- **API Documentation & Spec:**
  - OpenAPI Spec: `/doc` (JSON spec OpenAPI 3.0.0).
  - UI Docs Explorer: `/reference` ([Scalar](https://scalar.com/) API reference).
- **Authentication & Security (OWASP Top 10 Hardened):**
  - JWT Tokens (Web Crypto API `crypto.subtle` qua `tokenService.ts`).
  - Refresh Token luân phiên (Rotation) lưu trữ qua HTTP-only Cookie (`/api/auth`).
  - Password Hashing: PBKDF2-HMAC-SHA256 với 100.000 vòng lặp + Salt ngẫu nhiên 16 bytes (`passwordService.ts`).
  - Phân quyền (RBAC): `authMiddleware.ts` & `adminAuthMiddleware.ts`.
  - Bảo mật phòng vệ chuyên sâu: CORS Strict Whitelist (`apps/api/src/config/cors.ts`), Sliding Window Rate Limiting (`rateLimiter.ts`), Security Headers nosniff/XSS (`secureHeaders`).
- **Asset/Media Storage (Khuyến nghị cho Sản phẩm):** [Cloudflare R2](https://developers.cloudflare.com/r2/) lưu trữ hình ảnh/bản vẽ công trình độ phân giải cao với **0đ phí băng thông tải về (Zero Egress Fee)**.

---

## 2. Cấu Trúc Database Layer (Cloudflare D1 & Drizzle ORM)

Database Layer nằm trọn vẹn trong package `@khangviet/repositories`:

### 2.1. Kiến Trúc Bảng (Schema Definition tại `src/d1/schema/`)

| Bảng | Primary Key | Các Cột Chính | Mục Đích & Indexing |
| :--- | :--- | :--- | :--- |
| **`users`** | UUIDv7 | `email`, `password`, `role` (ADMIN/CUSTOMER), `name`, `phone`, `created_at`, `updated_at` | Lưu tài khoản và băm mật khẩu. Đánh B-Tree Index trên `email`. |
| **`leads`** | UUIDv7 | `full_name`, `phone`, `email`, `service_category`, `project_scale`, `message`, `status`, `notes`, `created_at`, `updated_at` | Khách đăng ký tư vấn. Đánh Index trên `status`, `created_at DESC`, `phone`. |
| **`projects`** | UUIDv7 | `code`, `title`, `subtitle`, `client`, `locations` (JSON), `year`, `category_tag`, `scale_metric`, `materials` (JSON), `engineering_notes` (JSON), `summary`, `cover_image`, `gallery` (JSON) | Danh mục công trình. Cột mảng lưu dưới dạng `mode: 'json'`. Đánh Index trên `code`, `category_tag`. |
| **`cms_metadata`** | Text Key | `key` ('hero_slides' \| 'legal_info'), `value_json`, `updated_at` | Document store cho các khối cấu hình linh hoạt của trang chủ. |
| **`pending_changes`** | UUIDv7 | `action`, `target_id`, `payload` (JSON), `status` (PENDING/APPLIED/DISCARDED), `created_at`, `applied_at` | Staging hàng đợi phê duyệt xuất bản trước khi public (Midnight Sync). |

### 2.2. Triển Khai Drivers (`src/d1/repositories/`)
- `D1UserRepository`: Tìm kiếm user bằng email, ID an toàn (ẩn mật khẩu), lấy danh sách người dùng.
- `D1LeadRepository`: Tạo lead, lọc/tìm kiếm lead theo trạng thái & từ khóa, cập nhật tiến trình tư vấn, xóa lead.
- `D1CmsRepository`: Tách nhỏ thành `D1CmsProjectRepo` và `D1CmsMetaRepo` (tuân thủ quy chuẩn file < 100 dòng), phối hợp lấy `LandingContent`, nạp pending changes và thực thi xuất bản đồng bộ.

### 2.3. Quản Trị Migration & Seeding
- **Drizzle Kit Config:** `packages/repositories/drizzle.config.ts`.
- **Lệnh sinh Migration SQL:** `pnpm --filter @khangviet/repositories run db:generate`.
- **File Migration chuẩn SQLite:** `packages/repositories/migrations/0000_magenta_midnight.sql`.
- **Kịch bản Seed Data:** `packages/repositories/src/d1/seed.ts` (Nạp tự động portfolio thật của Khang Việt, leads và tài khoản Admin doanh nghiệp).

---

## 3. Bản Đồ API Endpoints (`apps/api/src/routes`)

### 3.1. Public Content Routes (`/api/v1/content`)
*Mounted at: `apps/api/src/routes/publicContent.ts`*

| Method | Endpoint | Summary & Chức năng | Request / Param | Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/landing` | Lấy toàn bộ dữ liệu trang chủ (Hero, Intro, Projects, Legal,...) | Không | `{ success: true, data: LandingContent }` |
| `GET` | `/projects` | Lấy danh sách các dự án tiêu biểu | Không | `{ success: true, data: FeaturedProject[] }` |
| `GET` | `/projects/:id` | Lấy thông tin chi tiết một dự án theo ID | Param: `id` | `{ success: true, data: FeaturedProject }` (404 nếu không tìm thấy) |

---

### 3.2. Public Leads Routes (`/api/v1/leads`)
*Mounted at: `apps/api/src/routes/publicLeads.ts`*

| Method | Endpoint | Summary & Chức năng | Request / Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/` | Khách gửi thông tin liên hệ / đăng ký nhận tư vấn | Body: `CreateLeadDto` (`fullName`, `phone`, `email?`, `serviceCategory?`, `projectScale?`, `message?`) | `201 Created`: `{ success: true, data: ContactLead, message: string }` |

---

### 3.3. Authentication Routes (`/api/auth`)
*Mounted at: `apps/api/src/routes/auth.ts`*

| Method | Endpoint | Summary & Chức năng | Request / Body | Response / Cookie |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/login` | Đăng nhập tài khoản quản trị / người dùng | Body: `{ email, password }` | Set Cookie: `refreshToken` (HttpOnly).<br>Body: `{ success: true, data: { accessToken, user } }` |
| `POST` | `/refresh` | Cấp mới Access Token bằng Refresh Token từ cookie | Cookie: `refreshToken` | Set Cookie: `refreshToken` mới.<br>Body: `{ success: true, data: { accessToken } }` |

---

### 3.4. Protected User Routes (`/api`)
*Mounted at: `apps/api/src/routes/protected.ts` (Requires `authMiddleware` Bearer Token)*

| Method | Endpoint | Summary & Chức năng | Headers | Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/protected` | Kiểm tra trạng thái token và lấy thông tin user hiện tại | `Authorization: Bearer <accessToken>` | `{ success: true, data: { message, user } }` |

---

### 3.5. Admin CMS Routes (`/api/v1/admin/cms`)
*Mounted at: `apps/api/src/routes/adminCms.ts` (Requires `adminAuthMiddleware` - Role ADMIN)*

| Method | Endpoint | Summary & Chức năng | Request / Param / Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/sync-status` | Kiểm tra trạng thái đồng bộ & số lượng pending changes | Không |
| `GET` | `/pending-changes` | Lấy danh sách các thay đổi nội dung đang chờ duyệt | Không |
| `POST` | `/apply-changes` | Xuất bản (Publish) toàn bộ thay đổi đang chờ & trigger revalidate web | Không |
| `DELETE` | `/pending-changes/:id` | Hủy bỏ một thay đổi CMS đang chờ | Param: `id` |
| `POST` | `/projects` | Thêm dự án mới (hỗ trợ Staging/Direct tùy mode) | Body: `CreateProjectDto` |
| `PUT` | `/projects/:id` | Cập nhật dự án theo ID | Param: `id`, Body: `UpdateProjectDto` |
| `DELETE` | `/projects/:id` | Xóa dự án theo ID | Param: `id` |
| `PUT` | `/hero` | Cập nhật danh sách slider / hero section | Body: `{ slides: HeroSlide[] }` |
| `PUT` | `/legal` | Cập nhật thông tin pháp lý doanh nghiệp | Body: `LegalInfo` |

---

### 3.6. Admin Leads Routes (`/api/v1/admin/leads`)
*Mounted at: `apps/api/src/routes/adminLeads.ts` (Requires `adminAuthMiddleware` - Role ADMIN)*

| Method | Endpoint | Summary & Chức năng | Request / Query / Param |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Lấy danh sách khách hàng liên hệ (có lọc & tìm kiếm) | Query: `status?`, `search?` |
| `GET` | `/:id` | Lấy chi tiết thông tin một Lead theo ID | Param: `id` |
| `PATCH` | `/:id/status` | Cập nhật trạng thái xử lý Lead (`NEW`, `CONTACTED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`) và ghi chú | Param: `id`, Body: `{ status, notes? }` |
| `DELETE` | `/:id` | Xóa bản ghi Lead theo ID | Param: `id` |

---

## 4. Hướng Dẫn Sản Xuất & Triển Khai (Produce & Deploy API to Production)

Để đưa hệ thống Backend từ môi trường Local lên Production chạy trên Cloudflare Workers:

### Bước 1: Khởi tạo Database Cloudflare D1 trên Cloudflare
```bash
# Đăng nhập vào Cloudflare CLI
npx wrangler login

# Tạo Database D1 chính thức cho Khang Việt
npx wrangler d1 create khangviet-db
```
*Lưu lại `database_name` và `database_id` được in ra trên terminal.*

### Bước 2: Cấu hình Binding trong `apps/api/wrangler.jsonc`
Cập nhật khối `d1_databases` và các biến môi trường:
```jsonc
{
  "name": "api",
  "main": "src/index.ts",
  "compatibility_date": "2026-08-18",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "khangviet-db",
      "database_id": "<database_id_tu_buoc_1>"
    }
  ],
  "vars": {
    "NODE_ENV": "production",
    "WEB_APP_URL": "https://khangviet.vn"
  }
}
```

### Bước 3: Đẩy Migration & Khởi tạo Schema trên Production
```bash
# Thực thi file migration SQL trực tiếp lên Cloudflare D1 Production
npx wrangler d1 execute khangviet-db --remote --file=packages/repositories/migrations/0000_magenta_midnight.sql
```

### Bước 4: Thiết lập Secret (Bảo mật bắt buộc trước khi Deploy)
Tuyệt đối không lưu secret vào mã nguồn. Đặt secret trực tiếp lên Cloudflare:
```bash
# Thiết lập JWT Secret chính thức
npx wrangler secret put JWT_SECRET
# (Nhập chuỗi secret ngẫu nhiên bảo mật cao)
```

### Bước 5: Build và Triển khai (Deploy Worker)
```bash
# Chạy kiểm thử toàn diện
pnpm --filter api test:auth

# Deploy API lên mạng lưới Cloudflare
pnpm --filter api deploy
```

---

## 5. Tài Khoản Quản Trị Hệ Thống (Seed Defaults)

| Email | Mật khẩu mặc định | Vai trò | Ghi chú |
| :--- | :--- | :--- | :--- |
| `khangvietdesign@gmail.com` | `Khangviet687@` | `ADMIN` | Email doanh nghiệp chính thức (PBKDF2 Hashed) |
| `admin@khangviet.vn` | `Admin@123` | `ADMIN` | Tài khoản Admin nội bộ kỹ thuật |
| `customer@khangviet.vn` | `Customer@123` | `CUSTOMER` | Tài khoản test phân quyền RBAC |

---

## 6. Nguyên Tắc Cốt Lõi Cho Các Phiên Làm Việc Tiếp Theo
- **Contract-first:** Luôn cập nhật schema Zod tại `packages/types` và `apps/api/src/contracts/` trước khi viết handler.
- **Factory DB Resolution:** Khi gọi repo trong router/middleware, luôn truyền `c.env.DB` nếu có:
  ```ts
  const repos = getRepositories(c.env?.DB ? "d1" : "json", c.env?.DB);
  ```
- **Git Branch Discipline:** Tuân thủ `.agents/skills/git-branch-workflow.md`, kiểm tra nhánh trước khi stage/commit.
